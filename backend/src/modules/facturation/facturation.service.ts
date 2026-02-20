import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Classe, FrequencePaiement, StatutFacture, StatutInscription, TypeLigne } from '@prisma/client';
import { GenererFactureDto } from './dto/generer-facture.dto';
import { GenererBatchDto } from './dto/generer-batch.dto';
import { EnregistrerPaiementDto } from './dto/enregistrer-paiement.dto';
import { AjouterLigneDto, ModifierLigneDto } from './dto/ajouter-ligne.dto';
import { UpdateStatutDto } from './dto/update-statut.dto';
import {
  CreateConfigTarifDto,
  UpdateConfigTarifDto,
  UpsertConfigTarifDto,
} from './dto/config-tarif.dto';
import {
  CreateArticlePersonnaliseDto,
  UpdateArticlePersonnaliseDto,
} from './dto/article-personnalise.dto';
import {
  EnfantFacturable,
  DetailCalculScolarite,
  ResultatComptage,
  LigneFactureCalculee,
  ResultatCalculEnfant,
  CalculLignesOptions,
} from './dto/calcul-facture.dto';

@Injectable()
export class FacturationService {
  private readonly logger = new Logger(FacturationService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // FACTURES (existant, amélioré)
  // ============================================

  async getFacturesParent(parentId: number) {
    return this.prisma.facture.findMany({
      where: { parentId },
      include: { lignes: true, paiements: true, enfant: true },
      orderBy: { dateEmission: 'desc' },
    });
  }

  async getAllFactures(mois?: string) {
    const where: Record<string, unknown> = {};
    if (mois) {
      where.periode = mois;
    }

    return this.prisma.facture.findMany({
      where,
      include: {
        lignes: true,
        parent: { select: { id: true, nom: true, prenom: true, email: true } },
        enfant: { select: { id: true, nom: true, prenom: true, classe: true } },
      },
      orderBy: { dateEmission: 'desc' },
    });
  }

  async genererFacture(dto: GenererFactureDto) {
    const { parentId, periode, anneeScolaire } = dto;

    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        frequencePaiement: true,
        modePaiementPref: true,
        destinataireFacture: true,
      },
    });

    if (!parent) {
      throw new NotFoundException(`Parent #${parentId} non trouvé`);
    }

    const enfantsActifs = await this.getEnfantsActifs(parentId, anneeScolaire);
    if (enfantsActifs.length === 0) {
      throw new BadRequestException(
        `Aucun enfant actif pour le parent #${parentId} en ${anneeScolaire}`,
      );
    }

    const existante = await this.prisma.facture.findFirst({
      where: { parentId, periode, anneeScolaire },
      include: { lignes: true },
    });
    if (existante) {
      // Si la facture existante est vide (placeholder de l'ancien code), on la supprime pour régénérer
      if (existante.lignes.length === 0 && Number(existante.montantTotal) === 0) {
        await this.prisma.facture.delete({ where: { id: existante.id } });
        this.logger.warn(
          `Facture vide #${existante.id} supprimée pour régénération (parent #${parentId}, période ${periode})`,
        );
      } else {
        throw new ConflictException(
          `Une facture existe déjà pour le parent #${parentId} sur la période ${periode}`,
        );
      }
    }

    const options: CalculLignesOptions = {
      anneeScolaire,
      frequence: dto.frequence,
      inclureScolarite: dto.inclureScolarite,
      inclureRepas: dto.inclureRepas,
      inclurePeriscolaire: dto.inclurePeriscolaire,
      inclureInscription: dto.inclureInscription,
      inclureFonctionnement: dto.inclureFonctionnement,
    };

    const resultatsEnfants: ResultatCalculEnfant[] = [];
    for (const enfant of enfantsActifs) {
      const resultat = await this.calculerLignesFacture(
        enfant.id,
        periode,
        options,
      );
      resultatsEnfants.push(resultat);
    }

    const toutesLignes = resultatsEnfants.flatMap((r) => r.lignes);
    if (toutesLignes.length === 0) {
      throw new BadRequestException(
        'Aucune ligne à facturer pour cette période',
      );
    }

    const montantTotal = toutesLignes.reduce((sum, l) => sum + l.montant, 0);

    const dateEcheance = new Date();
    dateEcheance.setDate(5);
    const [year, month] = periode.split('-').map(Number);
    dateEcheance.setFullYear(year);
    dateEcheance.setMonth(month - 1);

    const facture = await this.prisma.$transaction(async (tx) => {
      // Génération du numéro DANS la transaction pour éviter les doublons
      const numero = await this.generateNumeroFacture(periode, tx);

      const created = await tx.facture.create({
        data: {
          numero,
          parentId,
          enfantId: enfantsActifs.length === 1 ? enfantsActifs[0].id : null,
          montantTotal: Math.round(montantTotal * 100) / 100,
          dateEmission: new Date(),
          dateEcheance,
          type: 'MENSUELLE',
          periode,
          anneeScolaire,
          destinataire: parent.destinataireFacture ?? undefined,
          modePaiement: parent.modePaiementPref ?? undefined,
          description: `Facture ${periode} - ${parent.prenom ?? ''} ${parent.nom ?? ''}`.trim(),
        },
      });

      const lignesData = toutesLignes.map((ligne) => ({
        factureId: created.id,
        description: ligne.description,
        quantite: ligne.quantite,
        prixUnit: ligne.prixUnit,
        montant: ligne.montant,
        type: ligne.type,
        commentaire: ligne.commentaire ?? null,
      }));

      await tx.ligneFacture.createMany({ data: lignesData });

      return tx.facture.findUnique({
        where: { id: created.id },
        include: {
          lignes: true,
          parent: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
          enfant: { select: { id: true, nom: true, prenom: true, classe: true } },
        },
      });
    });

    this.logger.log(
      `Facture ${facture?.numero} générée pour parent #${parentId} - ${toutesLignes.length} lignes - ${montantTotal.toFixed(2)}€`,
    );

    return facture;
  }

  async genererBatch(dto: GenererBatchDto) {
    const { periode, anneeScolaire } = dto;

    const parentsAvecEnfantsActifs = await this.prisma.user.findMany({
      where: {
        role: 'PARENT',
        actif: true,
        deletedAt: null,
        enfantsParent1: {
          some: {
            deletedAt: null,
            inscriptions: {
              some: {
                anneeScolaire,
                statut: StatutInscription.ACTIVE,
              },
            },
          },
        },
      },
      select: { id: true, nom: true, prenom: true },
    });

    const resultats: { parentId: number; parentNom: string; numero?: string; erreur?: string }[] = [];
    let totalFacture = 0;

    for (const parent of parentsAvecEnfantsActifs) {
      try {
        const facture = await this.genererFacture({
          parentId: parent.id,
          periode,
          anneeScolaire,
          inclureScolarite: dto.inclureScolarite,
          inclureRepas: dto.inclureRepas,
          inclurePeriscolaire: dto.inclurePeriscolaire,
          inclureInscription: dto.inclureInscription,
          inclureFonctionnement: dto.inclureFonctionnement,
        });
        resultats.push({
          parentId: parent.id,
          parentNom: `${parent.prenom ?? ''} ${parent.nom ?? ''}`.trim(),
          numero: facture?.numero,
        });
        totalFacture += Number(facture?.montantTotal ?? 0);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        resultats.push({
          parentId: parent.id,
          parentNom: `${parent.prenom ?? ''} ${parent.nom ?? ''}`.trim(),
          erreur: message,
        });
        this.logger.warn(
          `Erreur génération facture parent #${parent.id}: ${message}`,
        );
      }
    }

    const factureesCrees = resultats.filter((r) => r.numero);
    const erreurs = resultats.filter((r) => r.erreur);

    this.logger.log(
      `Batch ${periode}: ${factureesCrees.length} factures créées, ${erreurs.length} erreurs, total ${totalFacture.toFixed(2)}€`,
    );

    return {
      periode,
      anneeScolaire,
      facturesCreees: factureesCrees.length,
      erreurs: erreurs.length,
      totalFacture: Math.round(totalFacture * 100) / 100,
      details: resultats,
    };
  }

  async previsualiserFacture(dto: GenererFactureDto) {
    const { parentId, periode, anneeScolaire } = dto;

    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        frequencePaiement: true,
      },
    });

    if (!parent) {
      throw new NotFoundException(`Parent #${parentId} non trouvé`);
    }

    const enfantsActifs = await this.getEnfantsActifs(parentId, anneeScolaire);

    const options: CalculLignesOptions = {
      anneeScolaire,
      frequence: dto.frequence,
      inclureScolarite: dto.inclureScolarite,
      inclureRepas: dto.inclureRepas,
      inclurePeriscolaire: dto.inclurePeriscolaire,
      inclureInscription: dto.inclureInscription,
      inclureFonctionnement: dto.inclureFonctionnement,
    };

    const enfants: ResultatCalculEnfant[] = [];
    for (const enfant of enfantsActifs) {
      const resultat = await this.calculerLignesFacture(
        enfant.id,
        periode,
        options,
      );
      enfants.push(resultat);
    }

    const totalFamille = enfants.reduce((sum, e) => sum + e.totalNet, 0);

    return {
      parentId: parent.id,
      parentNom: `${parent.prenom ?? ''} ${parent.nom ?? ''}`.trim(),
      parentEmail: parent.email,
      frequencePaiement: parent.frequencePaiement ?? 'MENSUEL',
      enfants,
      totalFamille: Math.round(totalFamille * 100) / 100,
      periode,
    };
  }

  async getFactureById(id: number) {
    const facture = await this.prisma.facture.findUnique({
      where: { id },
      include: {
        lignes: { orderBy: { id: 'asc' } },
        paiements: { orderBy: { datePaiement: 'desc' } },
        parent: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
        enfant: { select: { id: true, nom: true, prenom: true, classe: true } },
      },
    });
    if (!facture) {
      throw new NotFoundException(`Facture #${id} non trouvée`);
    }
    return facture;
  }

  async getFactureParentById(id: number, parentId: number) {
    const facture = await this.prisma.facture.findFirst({
      where: { id, parentId },
      include: {
        lignes: { orderBy: { id: 'asc' } },
        paiements: { orderBy: { datePaiement: 'desc' } },
        enfant: { select: { id: true, nom: true, prenom: true, classe: true } },
      },
    });
    if (!facture) {
      throw new NotFoundException(`Facture #${id} non trouvée`);
    }
    return facture;
  }

  // Transitions de statut autorisées
  private static readonly TRANSITIONS_VALIDES: Record<StatutFacture, StatutFacture[]> = {
    [StatutFacture.EN_ATTENTE]: [StatutFacture.ENVOYEE, StatutFacture.ANNULEE],
    [StatutFacture.ENVOYEE]: [StatutFacture.EN_ATTENTE, StatutFacture.PAYEE, StatutFacture.PARTIELLE, StatutFacture.EN_RETARD, StatutFacture.ANNULEE],
    [StatutFacture.PARTIELLE]: [StatutFacture.PAYEE, StatutFacture.EN_RETARD, StatutFacture.ANNULEE],
    [StatutFacture.PAYEE]: [StatutFacture.EN_ATTENTE], // Permet de remettre en attente si erreur
    [StatutFacture.EN_RETARD]: [StatutFacture.EN_ATTENTE, StatutFacture.PAYEE, StatutFacture.PARTIELLE, StatutFacture.ANNULEE],
    [StatutFacture.ANNULEE]: [], // État terminal
  };

  async updateStatutFacture(id: number, dto: UpdateStatutDto) {
    const facture = await this.prisma.facture.findUnique({ where: { id } });
    if (!facture) {
      throw new NotFoundException(`Facture #${id} non trouvée`);
    }

    const transitionsPermises = FacturationService.TRANSITIONS_VALIDES[facture.statut];
    if (!transitionsPermises.includes(dto.statut)) {
      throw new BadRequestException(
        `Transition impossible : ${facture.statut} → ${dto.statut}. Transitions autorisées : ${transitionsPermises.join(', ') || 'aucune'}`,
      );
    }

    const data: Record<string, unknown> = { statut: dto.statut };
    if (dto.commentaire) {
      data.commentaire = dto.commentaire;
    }

    return this.prisma.facture.update({
      where: { id },
      data,
      include: { lignes: true, paiements: true },
    });
  }

  async enregistrerPaiement(factureId: number, dto: EnregistrerPaiementDto) {
    return this.prisma.$transaction(async (tx) => {
      // Lecture DANS la transaction pour éviter les race conditions
      const facture = await tx.facture.findUnique({
        where: { id: factureId },
      });
      if (!facture) {
        throw new NotFoundException(`Facture #${factureId} non trouvée`);
      }

      if (facture.statut === StatutFacture.ANNULEE) {
        throw new BadRequestException('Impossible d\'enregistrer un paiement sur une facture annulée');
      }

      const resteAPayer = Number(facture.montantTotal) - Number(facture.montantPaye);
      if (dto.montant > resteAPayer) {
        throw new BadRequestException(
          `Le montant (${dto.montant}€) dépasse le reste à payer (${resteAPayer.toFixed(2)}€)`,
        );
      }

      await tx.paiement.create({
        data: {
          factureId,
          montant: dto.montant,
          datePaiement: new Date(dto.datePaiement),
          modePaiement: dto.modePaiement,
          reference: dto.reference,
          commentaire: dto.commentaire,
        },
      });

      const totalPaye = Number(facture.montantPaye) + dto.montant;
      const montantTotal = Number(facture.montantTotal);
      let nouveauStatut: StatutFacture;
      if (totalPaye >= montantTotal) {
        nouveauStatut = StatutFacture.PAYEE;
      } else if (totalPaye > 0) {
        nouveauStatut = StatutFacture.PARTIELLE;
      } else {
        nouveauStatut = facture.statut;
      }

      return tx.facture.update({
        where: { id: factureId },
        data: {
          montantPaye: Math.round(totalPaye * 100) / 100,
          statut: nouveauStatut,
        },
        include: {
          lignes: true,
          paiements: true,
          parent: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
        },
      });
    });
  }

  async ajouterLigne(factureId: number, dto: AjouterLigneDto) {
    const montantLigne = Math.round(dto.quantite * dto.prixUnit * 100) / 100;

    return this.prisma.$transaction(async (tx) => {
      const facture = await tx.facture.findUnique({ where: { id: factureId } });
      if (!facture) {
        throw new NotFoundException(`Facture #${factureId} non trouvée`);
      }

      await tx.ligneFacture.create({
        data: {
          factureId,
          description: dto.description,
          quantite: dto.quantite,
          prixUnit: dto.prixUnit,
          montant: montantLigne,
          type: dto.type,
          commentaire: dto.commentaire,
        },
      });

      const nouveauTotal = Number(facture.montantTotal) + montantLigne;
      return tx.facture.update({
        where: { id: factureId },
        data: { montantTotal: Math.round(nouveauTotal * 100) / 100 },
        include: { lignes: true },
      });
    });
  }

  async modifierLigne(factureId: number, ligneId: number, dto: ModifierLigneDto) {
    return this.prisma.$transaction(async (tx) => {
      const ligne = await tx.ligneFacture.findFirst({
        where: { id: ligneId, factureId },
      });
      if (!ligne) {
        throw new NotFoundException(
          `Ligne #${ligneId} non trouvée sur la facture #${factureId}`,
        );
      }

      const quantite = dto.quantite ?? ligne.quantite;
      const prixUnit = dto.prixUnit ?? Number(ligne.prixUnit);
      const nouveauMontant = Math.round(quantite * prixUnit * 100) / 100;
      const diffMontant = nouveauMontant - Number(ligne.montant);

      await tx.ligneFacture.update({
        where: { id: ligneId },
        data: {
          description: dto.description,
          quantite: dto.quantite,
          prixUnit: dto.prixUnit,
          montant: nouveauMontant,
          commentaire: dto.commentaire,
        },
      });

      const facture = await tx.facture.findUnique({ where: { id: factureId } });
      const nouveauTotal = Number(facture!.montantTotal) + diffMontant;

      return tx.facture.update({
        where: { id: factureId },
        data: { montantTotal: Math.round(nouveauTotal * 100) / 100 },
        include: { lignes: true },
      });
    });
  }

  async supprimerLigne(factureId: number, ligneId: number) {
    return this.prisma.$transaction(async (tx) => {
      const ligne = await tx.ligneFacture.findFirst({
        where: { id: ligneId, factureId },
      });
      if (!ligne) {
        throw new NotFoundException(
          `Ligne #${ligneId} non trouvée sur la facture #${factureId}`,
        );
      }

      await tx.ligneFacture.delete({ where: { id: ligneId } });

      const facture = await tx.facture.findUnique({ where: { id: factureId } });
      const nouveauTotal = Number(facture!.montantTotal) - Number(ligne.montant);

      return tx.facture.update({
        where: { id: factureId },
        data: { montantTotal: Math.max(0, Math.round(nouveauTotal * 100) / 100) },
        include: { lignes: true },
      });
    });
  }

  async getStats() {
    const [total, enAttente, payees, partielles, enRetard, annulees] =
      await Promise.all([
        this.prisma.facture.aggregate({ _sum: { montantTotal: true }, _count: true }),
        this.prisma.facture.aggregate({
          where: { statut: StatutFacture.EN_ATTENTE },
          _sum: { montantTotal: true },
          _count: true,
        }),
        this.prisma.facture.aggregate({
          where: { statut: StatutFacture.PAYEE },
          _sum: { montantTotal: true },
          _count: true,
        }),
        this.prisma.facture.aggregate({
          where: { statut: StatutFacture.PARTIELLE },
          _sum: { montantTotal: true },
          _count: true,
        }),
        this.prisma.facture.aggregate({
          where: { statut: StatutFacture.EN_RETARD },
          _sum: { montantTotal: true },
          _count: true,
        }),
        this.prisma.facture.aggregate({
          where: { statut: StatutFacture.ANNULEE },
          _sum: { montantTotal: true },
          _count: true,
        }),
      ]);

    const totalPaye = await this.prisma.facture.aggregate({
      _sum: { montantPaye: true },
    });

    return {
      totalFactures: total._count,
      montantTotal: Number(total._sum.montantTotal ?? 0),
      montantPaye: Number(totalPaye._sum.montantPaye ?? 0),
      enAttente: { count: enAttente._count, montant: Number(enAttente._sum.montantTotal ?? 0) },
      payees: { count: payees._count, montant: Number(payees._sum.montantTotal ?? 0) },
      partielles: { count: partielles._count, montant: Number(partielles._sum.montantTotal ?? 0) },
      enRetard: { count: enRetard._count, montant: Number(enRetard._sum.montantTotal ?? 0) },
      annulees: { count: annulees._count, montant: Number(annulees._sum.montantTotal ?? 0) },
    };
  }

  private async generateNumeroFacture(
    periode: string,
    tx?: { facture: typeof this.prisma.facture; $queryRawUnsafe: typeof this.prisma.$queryRawUnsafe },
  ): Promise<string> {
    const client = tx ?? this.prisma;
    const prefix = `FA-${periode.replace('-', '')}`;

    // Utiliser un verrou advisory PostgreSQL pour éviter les doublons
    // Le hash du prefix sert d'identifiant de verrou
    const lockId = Array.from(prefix).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    await client.$queryRawUnsafe(`SELECT pg_advisory_xact_lock(${lockId})`);

    const lastFacture = await client.facture.findFirst({
      where: { numero: { startsWith: prefix } },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    let sequence = 1;
    if (lastFacture) {
      const parts = lastFacture.numero.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  // ============================================
  // CONFIG TARIFS
  // ============================================

  async getConfigTarifs(anneeScolaire?: string, categorie?: string) {
    const where: Record<string, unknown> = { actif: true };
    if (anneeScolaire) where.anneeScolaire = anneeScolaire;
    if (categorie) where.categorie = categorie;

    return this.prisma.configTarif.findMany({
      where,
      orderBy: [{ categorie: 'asc' }, { cle: 'asc' }],
    });
  }

  async getConfigTarifByCle(cle: string, anneeScolaire: string) {
    const tarif = await this.prisma.configTarif.findUnique({
      where: { cle_anneeScolaire: { cle, anneeScolaire } },
    });
    if (!tarif) {
      throw new NotFoundException(
        `Tarif '${cle}' non trouvé pour l'année ${anneeScolaire}`,
      );
    }
    return tarif;
  }

  async createConfigTarif(dto: CreateConfigTarifDto) {
    try {
      return await this.prisma.configTarif.create({
        data: {
          cle: dto.cle,
          valeur: dto.valeur,
          description: dto.description,
          anneeScolaire: dto.anneeScolaire,
          categorie: dto.categorie,
        },
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Le tarif '${dto.cle}' existe déjà pour l'année ${dto.anneeScolaire}`,
        );
      }
      throw error;
    }
  }

  async updateConfigTarif(id: number, dto: UpdateConfigTarifDto) {
    const existing = await this.prisma.configTarif.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Tarif #${id} non trouvé`);
    }
    return this.prisma.configTarif.update({
      where: { id },
      data: dto,
    });
  }

  async upsertConfigTarif(dto: UpsertConfigTarifDto) {
    return this.prisma.configTarif.upsert({
      where: {
        cle_anneeScolaire: {
          cle: dto.cle,
          anneeScolaire: dto.anneeScolaire,
        },
      },
      update: {
        valeur: dto.valeur,
        description: dto.description,
        categorie: dto.categorie,
        actif: true,
      },
      create: {
        cle: dto.cle,
        valeur: dto.valeur,
        description: dto.description,
        anneeScolaire: dto.anneeScolaire,
        categorie: dto.categorie,
      },
    });
  }

  async seedDefaultTarifs(anneeScolaire: string) {
    const defaults = [
      // Scolarité - Maison des enfants / Élémentaire
      { cle: 'SCOLARITE_MENSUEL', valeur: 575.0, description: 'Scolarité mensuelle - 1 enfant (maison/élémentaire)', categorie: 'SCOLARITE' },
      { cle: 'SCOLARITE_TRIMESTRIEL', valeur: 1725.0, description: 'Scolarité trimestrielle - 1 enfant (maison/élémentaire)', categorie: 'SCOLARITE' },
      { cle: 'SCOLARITE_ANNUEL', valeur: 6900.0, description: 'Scolarité annuelle - 1 enfant (maison/élémentaire)', categorie: 'SCOLARITE' },
      { cle: 'SCOLARITE_FRATRIE_MENSUEL', valeur: 540.0, description: 'Scolarité mensuelle - fratrie (maison/élémentaire)', categorie: 'SCOLARITE' },
      { cle: 'SCOLARITE_FRATRIE_TRIMESTRIEL', valeur: 1620.0, description: 'Scolarité trimestrielle - fratrie (maison/élémentaire)', categorie: 'SCOLARITE' },
      { cle: 'SCOLARITE_FRATRIE_ANNUEL', valeur: 6480.0, description: 'Scolarité annuelle - fratrie (maison/élémentaire)', categorie: 'SCOLARITE' },
      // Scolarité - Collège
      { cle: 'SCOLARITE_COLLEGE_MENSUEL', valeur: 710.0, description: 'Scolarité mensuelle - 1 enfant (collège)', categorie: 'SCOLARITE' },
      { cle: 'SCOLARITE_COLLEGE_TRIMESTRIEL', valeur: 2130.0, description: 'Scolarité trimestrielle - 1 enfant (collège)', categorie: 'SCOLARITE' },
      { cle: 'SCOLARITE_COLLEGE_ANNUEL', valeur: 8520.0, description: 'Scolarité annuelle - 1 enfant (collège)', categorie: 'SCOLARITE' },
      { cle: 'SCOLARITE_COLLEGE_FRATRIE_MENSUEL', valeur: 640.0, description: 'Scolarité mensuelle - fratrie (collège)', categorie: 'SCOLARITE' },
      { cle: 'SCOLARITE_COLLEGE_FRATRIE_TRIMESTRIEL', valeur: 1920.0, description: 'Scolarité trimestrielle - fratrie (collège)', categorie: 'SCOLARITE' },
      { cle: 'SCOLARITE_COLLEGE_FRATRIE_ANNUEL', valeur: 7680.0, description: 'Scolarité annuelle - fratrie (collège)', categorie: 'SCOLARITE' },
      // Inscription
      { cle: 'INSCRIPTION_PREMIERE_ANNEE', valeur: 350.0, description: "Frais d'inscription 1ère année - 1 enfant", categorie: 'INSCRIPTION' },
      { cle: 'INSCRIPTION_FRATRIE_PREMIERE', valeur: 150.0, description: "Frais d'inscription 1ère année - fratrie", categorie: 'INSCRIPTION' },
      { cle: 'INSCRIPTION_ANNEES_SUIVANTES', valeur: 195.0, description: "Frais d'inscription années suivantes - 1 enfant", categorie: 'INSCRIPTION' },
      { cle: 'INSCRIPTION_FRATRIE_SUIVANTES', valeur: 160.0, description: "Frais d'inscription années suivantes - fratrie", categorie: 'INSCRIPTION' },
      // Fonctionnement (matériel pédagogique)
      { cle: 'FONCTIONNEMENT_MATERNELLE', valeur: 65.0, description: 'Frais matériel pédagogique - 3 à 6 ans', categorie: 'FONCTIONNEMENT' },
      { cle: 'FONCTIONNEMENT_ELEMENTAIRE', valeur: 85.0, description: 'Frais matériel pédagogique - 6 à 12 ans', categorie: 'FONCTIONNEMENT' },
      { cle: 'FONCTIONNEMENT_COLLEGE', valeur: 95.0, description: 'Frais matériel pédagogique - collège', categorie: 'FONCTIONNEMENT' },
      // Fratrie
      { cle: 'REDUCTION_FRATRIE_POURCENTAGE', valeur: 6.0, description: 'Réduction fratrie en % (maison/élémentaire)', categorie: 'FRATRIE' },
      { cle: 'REDUCTION_FRATRIE_COLLEGE_POURCENTAGE', valeur: 19.0, description: 'Réduction fratrie en % (collège) - RFR', categorie: 'FRATRIE' },
      // Repas
      { cle: 'REPAS_MIDI', valeur: 5.45, description: 'Tarif repas du midi (traiteur)', categorie: 'REPAS' },
      // Périscolaire
      { cle: 'PERISCOLAIRE_SEANCE', valeur: 6.20, description: 'Tarif périscolaire par séance (16h-17h30, goûter inclus)', categorie: 'PERISCOLAIRE' },
    ];

    const results = [];
    for (const tarif of defaults) {
      const result = await this.upsertConfigTarif({
        ...tarif,
        anneeScolaire,
      });
      results.push(result);
    }

    this.logger.log(
      `${results.length} tarifs par défaut créés/mis à jour pour ${anneeScolaire}`,
    );
    return results;
  }

  // ============================================
  // ARTICLES PERSONNALISÉS
  // ============================================

  async getArticlesPersonnalises(actifsUniquement: boolean = true) {
    const where = actifsUniquement ? { actif: true } : {};
    return this.prisma.articlePersonnalise.findMany({
      where,
      orderBy: { nom: 'asc' },
    });
  }

  async getArticlePersonnalise(id: number) {
    const article = await this.prisma.articlePersonnalise.findUnique({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException(`Article #${id} non trouvé`);
    }
    return article;
  }

  async createArticlePersonnalise(dto: CreateArticlePersonnaliseDto) {
    return this.prisma.articlePersonnalise.create({
      data: {
        nom: dto.nom,
        description: dto.description,
        prixDefaut: dto.prixDefaut,
      },
    });
  }

  async updateArticlePersonnalise(id: number, dto: UpdateArticlePersonnaliseDto) {
    const existing = await this.prisma.articlePersonnalise.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Article #${id} non trouvé`);
    }
    return this.prisma.articlePersonnalise.update({
      where: { id },
      data: dto,
    });
  }

  async deleteArticlePersonnalise(id: number) {
    const existing = await this.prisma.articlePersonnalise.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Article #${id} non trouvé`);
    }
    return this.prisma.articlePersonnalise.update({
      where: { id },
      data: { actif: false },
    });
  }

  // ============================================
  // MOTEUR DE CALCUL - Phase 2
  // ============================================

  /**
   * Récupère les enfants actifs d'un parent avec leur contexte de facturation
   */
  async getEnfantsActifs(
    parentId: number,
    anneeScolaire: string,
  ): Promise<EnfantFacturable[]> {
    const enfants = await this.prisma.enfant.findMany({
      where: {
        OR: [{ parent1Id: parentId }, { parent2Id: parentId }],
        deletedAt: null,
        inscriptions: {
          some: {
            anneeScolaire,
            statut: StatutInscription.ACTIVE,
          },
        },
      },
      include: {
        inscriptions: {
          where: { anneeScolaire, statut: StatutInscription.ACTIVE },
        },
      },
      orderBy: { dateNaissance: 'asc' }, // Aîné en premier
    });

    const result: EnfantFacturable[] = [];
    for (let i = 0; i < enfants.length; i++) {
      const enfant = enfants[i];
      if (!enfant.classe) {
        throw new BadRequestException(
          `Enfant #${enfant.id} (${enfant.prenom} ${enfant.nom}) n'a pas de classe définie. Veuillez lui attribuer une classe avant de facturer.`,
        );
      }
      const estPremiereAnnee = await this.isPremiereAnnee(
        enfant.id,
        anneeScolaire,
      );
      result.push({
        id: enfant.id,
        nom: enfant.nom,
        prenom: enfant.prenom,
        dateNaissance: enfant.dateNaissance,
        classe: enfant.classe as Classe,
        rangFratrie: i + 1,
        estPremiereAnnee,
      });
    }
    return result;
  }

  /**
   * Compte le nombre d'enfants actifs (fratrie) pour un parent
   */
  async countFratrie(parentId: number, anneeScolaire: string): Promise<number> {
    return this.prisma.enfant.count({
      where: {
        OR: [{ parent1Id: parentId }, { parent2Id: parentId }],
        deletedAt: null,
        inscriptions: {
          some: {
            anneeScolaire,
            statut: StatutInscription.ACTIVE,
          },
        },
      },
    });
  }

  /**
   * Vérifie si c'est la première année d'inscription de l'enfant
   */
  async isPremiereAnnee(
    enfantId: number,
    anneeScolaire: string,
  ): Promise<boolean> {
    // Compter les inscriptions AVANT l'année scolaire en cours
    const previousInscriptions = await this.prisma.inscription.count({
      where: {
        enfantId,
        statut: { in: [StatutInscription.ACTIVE, StatutInscription.TERMINEE] },
        anneeScolaire: {
          lt: anneeScolaire,
        },
      },
    });

    return previousInscriptions === 0;
  }

  /**
   * Calcule l'âge à une date donnée
   */
  private calculateAge(birthDate: Date, referenceDate: Date): number {
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  /**
   * Détermine si la scolarité doit être facturée ce mois selon la fréquence
   */
  private shouldBillScolarite(
    mois: string,
    frequence: FrequencePaiement,
  ): boolean {
    const [, month] = mois.split('-').map(Number);

    switch (frequence) {
      case 'MENSUEL':
        return true;
      case 'TRIMESTRIEL':
        // Septembre, Décembre, Mars, Juin
        return [9, 12, 3, 6].includes(month);
      case 'SEMESTRIEL':
        // Septembre et Mars
        return [9, 3].includes(month);
      case 'ANNUEL':
        // Août (avant rentrée)
        return month === 8;
      default:
        return true;
    }
  }

  /**
   * Génère une description lisible pour la ligne scolarité
   */
  private getScolariteDescription(
    classe: Classe,
    frequence: FrequencePaiement,
  ): string {
    const classeLabel =
      classe === 'COLLEGE' ? 'Collège' : 'Maison des enfants / Élémentaire';
    const frequenceLabel: Record<FrequencePaiement, string> = {
      MENSUEL: 'mensuelle',
      TRIMESTRIEL: 'trimestrielle',
      SEMESTRIEL: 'semestrielle',
      ANNUEL: 'annuelle',
    };
    return `Scolarité ${frequenceLabel[frequence]} - ${classeLabel}`;
  }

  /**
   * Calcule les frais de scolarité avec détail des réductions
   */
  async calculerScolarite(
    enfantId: number,
    frequence: FrequencePaiement,
    rangFratrie: number,
    anneeScolaire: string,
  ): Promise<DetailCalculScolarite> {
    const enfant = await this.prisma.enfant.findUnique({
      where: { id: enfantId },
      include: { parent1: { select: { id: true, nom: true, prenom: true, frequencePaiement: true, reductionRFR: true, tauxReductionRFR: true } } },
    });

    if (!enfant || !enfant.classe) {
      throw new NotFoundException(
        `Enfant #${enfantId} non trouvé ou sans classe`,
      );
    }

    const isCollege = enfant.classe === 'COLLEGE';
    const estFratrie = rangFratrie > 1;

    // Construire la clé du tarif
    let cle: string;
    if (isCollege) {
      cle = estFratrie
        ? `SCOLARITE_COLLEGE_FRATRIE_${frequence}`
        : `SCOLARITE_COLLEGE_${frequence}`;
    } else {
      cle = estFratrie
        ? `SCOLARITE_FRATRIE_${frequence}`
        : `SCOLARITE_${frequence}`;
    }

    const tarif = await this.getConfigTarifByCle(cle, anneeScolaire);
    const montantBase = Number(tarif.valeur);

    // Calculer la réduction fratrie (informatif)
    let reductionFratrie = 0;
    if (estFratrie) {
      const cleNormal = isCollege
        ? `SCOLARITE_COLLEGE_${frequence}`
        : `SCOLARITE_${frequence}`;
      try {
        const tarifNormal = await this.getConfigTarifByCle(
          cleNormal,
          anneeScolaire,
        );
        reductionFratrie = Number(tarifNormal.valeur) - montantBase;
      } catch {
        // Si le tarif normal n'existe pas, on ignore
      }
    }

    // Calculer la réduction RFR
    const reductionRFR = await this.calculerReductionRFR(
      montantBase,
      enfant.parent1Id,
    );

    return {
      montantBase,
      estFratrie,
      reductionFratrie,
      reductionRFR,
      montantFinal: Math.round((montantBase - reductionRFR) * 100) / 100,
    };
  }

  /**
   * Calcule la réduction RFR si applicable
   */
  async calculerReductionRFR(
    montant: number,
    parentId: number,
  ): Promise<number> {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      select: { reductionRFR: true, tauxReductionRFR: true },
    });

    if (!parent || !parent.reductionRFR || !parent.tauxReductionRFR) {
      return 0;
    }

    const taux = Number(parent.tauxReductionRFR);
    return Math.round((montant * taux) / 100 * 100) / 100;
  }

  /**
   * Calcule les frais d'inscription
   */
  async calculerInscription(
    rangFratrie: number,
    estPremiereAnnee: boolean,
    anneeScolaire: string,
  ): Promise<number> {
    const estFratrie = rangFratrie > 1;

    let cle: string;
    if (estPremiereAnnee) {
      cle = estFratrie
        ? 'INSCRIPTION_FRATRIE_PREMIERE'
        : 'INSCRIPTION_PREMIERE_ANNEE';
    } else {
      cle = estFratrie
        ? 'INSCRIPTION_FRATRIE_SUIVANTES'
        : 'INSCRIPTION_ANNEES_SUIVANTES';
    }

    const tarif = await this.getConfigTarifByCle(cle, anneeScolaire);
    return Number(tarif.valeur);
  }

  /**
   * Calcule les frais de fonctionnement/matériel pédagogique
   */
  async calculerFonctionnement(
    enfantId: number,
    anneeScolaire: string,
  ): Promise<number> {
    const enfant = await this.prisma.enfant.findUnique({
      where: { id: enfantId },
      select: { classe: true, dateNaissance: true },
    });

    if (!enfant) {
      throw new NotFoundException(`Enfant #${enfantId} non trouvé`);
    }

    let cle: string;

    if (enfant.classe) {
      switch (enfant.classe) {
        case 'COLLEGE':
          cle = 'FONCTIONNEMENT_COLLEGE';
          break;
        case 'ELEMENTAIRE':
          cle = 'FONCTIONNEMENT_ELEMENTAIRE';
          break;
        case 'MATERNELLE':
        default:
          cle = 'FONCTIONNEMENT_MATERNELLE';
      }
    } else if (enfant.dateNaissance) {
      // Calcul basé sur l'âge si pas de classe
      const [anneeDebut] = anneeScolaire.split('-').map(Number);
      const dateRentree = new Date(anneeDebut, 8, 1); // 1er septembre
      const age = this.calculateAge(enfant.dateNaissance, dateRentree);

      if (age >= 11) {
        cle = 'FONCTIONNEMENT_COLLEGE';
      } else if (age >= 6) {
        cle = 'FONCTIONNEMENT_ELEMENTAIRE';
      } else {
        cle = 'FONCTIONNEMENT_MATERNELLE';
      }
    } else {
      cle = 'FONCTIONNEMENT_MATERNELLE';
    }

    const tarif = await this.getConfigTarifByCle(cle, anneeScolaire);
    return Number(tarif.valeur);
  }

  /**
   * Calcule les repas du mois
   */
  async calculerRepas(
    enfantId: number,
    mois: string,
    anneeScolaire: string,
  ): Promise<ResultatComptage> {
    const [year, month] = mois.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Dernier jour du mois

    const count = await this.prisma.repas.count({
      where: {
        enfantId,
        dateRepas: { gte: startDate, lte: endDate },
        type: 'MIDI',
      },
    });

    if (count === 0) {
      return { count: 0, montant: 0 };
    }

    const tarif = await this.getConfigTarifByCle('REPAS_MIDI', anneeScolaire);
    const prixUnitaire = Number(tarif.valeur);
    const montant = Math.round(count * prixUnitaire * 100) / 100;

    return { count, montant };
  }

  /**
   * Calcule le périscolaire du mois
   */
  async calculerPeriscolaire(
    enfantId: number,
    mois: string,
    anneeScolaire: string,
  ): Promise<ResultatComptage> {
    const [year, month] = mois.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const count = await this.prisma.periscolaire.count({
      where: {
        enfantId,
        datePeriscolaire: { gte: startDate, lte: endDate },
      },
    });

    if (count === 0) {
      return { count: 0, montant: 0 };
    }

    const tarif = await this.getConfigTarifByCle(
      'PERISCOLAIRE_SEANCE',
      anneeScolaire,
    );
    const prixUnitaire = Number(tarif.valeur);
    const montant = Math.round(count * prixUnitaire * 100) / 100;

    return { count, montant };
  }

  /**
   * Calcule toutes les lignes de facture pour un enfant
   * C'est la méthode principale d'orchestration du moteur de calcul
   */
  async calculerLignesFacture(
    enfantId: number,
    mois: string,
    options: CalculLignesOptions,
  ): Promise<ResultatCalculEnfant> {
    const { anneeScolaire } = options;

    // Récupérer l'enfant avec ses infos
    const enfant = await this.prisma.enfant.findUnique({
      where: { id: enfantId },
      include: {
        parent1: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            frequencePaiement: true,
            reductionRFR: true,
            tauxReductionRFR: true,
          },
        },
        inscriptions: { where: { anneeScolaire, statut: StatutInscription.ACTIVE } },
      },
    });

    if (!enfant || !enfant.classe) {
      throw new NotFoundException(
        `Enfant #${enfantId} non trouvé ou sans classe`,
      );
    }

    // Déterminer le rang dans la fratrie
    const enfantsActifs = await this.getEnfantsActifs(
      enfant.parent1Id,
      anneeScolaire,
    );
    const indexEnfant = enfantsActifs.findIndex((e) => e.id === enfantId);
    const rangFratrie = indexEnfant >= 0 ? indexEnfant + 1 : 1;
    const estPremiereAnnee = await this.isPremiereAnnee(enfantId, anneeScolaire);

    const lignes: LigneFactureCalculee[] = [];
    let totalReductions = 0;

    // Fréquence de paiement
    const frequence =
      options.frequence || enfant.parent1.frequencePaiement || 'MENSUEL';

    // 1. SCOLARITÉ
    if (
      options.inclureScolarite !== false &&
      this.shouldBillScolarite(mois, frequence)
    ) {
      const scolarite = await this.calculerScolarite(
        enfantId,
        frequence,
        rangFratrie,
        anneeScolaire,
      );

      lignes.push({
        type: 'SCOLARITE' as TypeLigne,
        description: this.getScolariteDescription(
          enfant.classe as Classe,
          frequence,
        ),
        quantite: 1,
        prixUnit: scolarite.montantBase,
        montant: scolarite.montantBase,
      });

      // Ajouter réduction RFR comme ligne séparée si applicable
      if (scolarite.reductionRFR > 0) {
        lignes.push({
          type: 'REDUCTION' as TypeLigne,
          description: 'Réduction RFR',
          quantite: 1,
          prixUnit: -scolarite.reductionRFR,
          montant: -scolarite.reductionRFR,
          commentaire: `Taux: ${enfant.parent1.tauxReductionRFR}%`,
        });
        totalReductions += scolarite.reductionRFR;
      }
    }

    // 2. INSCRIPTION (septembre uniquement)
    const [, month] = mois.split('-').map(Number);
    if (options.inclureInscription && month === 9) {
      const inscription = await this.calculerInscription(
        rangFratrie,
        estPremiereAnnee,
        anneeScolaire,
      );
      lignes.push({
        type: 'INSCRIPTION' as TypeLigne,
        description: estPremiereAnnee
          ? "Frais d'inscription (1ère année)"
          : "Frais d'inscription (réinscription)",
        quantite: 1,
        prixUnit: inscription,
        montant: inscription,
      });
    }

    // 3. FONCTIONNEMENT (septembre uniquement)
    if (options.inclureFonctionnement && month === 9) {
      const fonctionnement = await this.calculerFonctionnement(
        enfantId,
        anneeScolaire,
      );
      lignes.push({
        type: 'MATERIEL' as TypeLigne,
        description: 'Frais de matériel pédagogique',
        quantite: 1,
        prixUnit: fonctionnement,
        montant: fonctionnement,
      });
    }

    // 4. REPAS
    if (options.inclureRepas !== false) {
      const repas = await this.calculerRepas(enfantId, mois, anneeScolaire);
      if (repas.count > 0) {
        const tarifRepas = await this.getConfigTarifByCle(
          'REPAS_MIDI',
          anneeScolaire,
        );
        lignes.push({
          type: 'REPAS' as TypeLigne,
          description: `Repas du mois (${repas.count} repas)`,
          quantite: repas.count,
          prixUnit: Number(tarifRepas.valeur),
          montant: repas.montant,
        });
      }
    }

    // 5. PÉRISCOLAIRE
    if (options.inclurePeriscolaire !== false) {
      const peri = await this.calculerPeriscolaire(
        enfantId,
        mois,
        anneeScolaire,
      );
      if (peri.count > 0) {
        const tarifPeri = await this.getConfigTarifByCle(
          'PERISCOLAIRE_SEANCE',
          anneeScolaire,
        );
        lignes.push({
          type: 'PERISCOLAIRE' as TypeLigne,
          description: `Périscolaire du mois (${peri.count} séances)`,
          quantite: peri.count,
          prixUnit: Number(tarifPeri.valeur),
          montant: peri.montant,
        });
      }
    }

    // Calculer les totaux
    const totalAvantReduction = lignes
      .filter((l) => l.type !== 'REDUCTION')
      .reduce((sum, l) => sum + l.montant, 0);
    const totalNet = lignes.reduce((sum, l) => sum + l.montant, 0);

    return {
      enfantId,
      enfantNom: enfant.nom,
      enfantPrenom: enfant.prenom,
      classe: enfant.classe as Classe,
      rangFratrie,
      lignes,
      totalAvantReduction: Math.round(totalAvantReduction * 100) / 100,
      totalReductions: Math.round(totalReductions * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
    };
  }
}
