import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateConfigTarifDto,
  UpdateConfigTarifDto,
  UpsertConfigTarifDto,
} from './dto/config-tarif.dto';
import {
  CreateArticlePersonnaliseDto,
  UpdateArticlePersonnaliseDto,
} from './dto/article-personnalise.dto';

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

  async genererFactureMensuelle(parentId: number, periode: string) {
    const numero = this.generateNumeroFacture();

    return this.prisma.facture.create({
      data: {
        numero,
        parentId,
        montantTotal: 0,
        dateEmission: new Date(),
        dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'MENSUELLE',
        periode,
        description: `Facture mensuelle ${periode}`,
      },
    });
  }

  private generateNumeroFacture(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FA-${year}${month}-${random}`;
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
}
