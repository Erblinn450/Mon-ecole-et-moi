import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, StatutInscription } from '@prisma/client';

interface UserPayload {
  id: number;
  email: string;
  role: Role;
}

@Injectable()
export class JustificatifsService {
  private readonly logger = new Logger(JustificatifsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Vérifie que l'enfant appartient au parent connecté
   * Les admins ont accès à tous les enfants
   */
  private async verifyEnfantOwnership(enfantId: number, user: UserPayload): Promise<void> {
    // Les admins ont accès à tout
    if (user.role === Role.ADMIN) {
      return;
    }

    const enfant = await this.prisma.enfant.findUnique({
      where: { id: enfantId },
      select: { parent1Id: true, parent2Id: true },
    });

    if (!enfant) {
      throw new NotFoundException('Enfant non trouvé');
    }

    // Vérifier que l'utilisateur est parent1 ou parent2
    if (enfant.parent1Id !== user.id && enfant.parent2Id !== user.id) {
      throw new ForbiddenException('Vous n\'avez pas accès à cet enfant');
    }
  }

  async getTypesAttendus() {
    return this.prisma.justificatifAttendu.findMany({
      where: {
        // Exclure le "Règlement intérieur signé" car géré via signature électronique
        NOT: {
          nom: { contains: 'Règlement', mode: 'insensitive' },
        },
      },
      orderBy: { obligatoire: 'desc' },
    });
  }

  async getJustificatifsEnfant(enfantId: number, user: UserPayload) {
    // Vérifier que l'utilisateur a accès à cet enfant
    await this.verifyEnfantOwnership(enfantId, user);

    const justificatifs = await this.prisma.justificatif.findMany({
      where: { enfantId },
      include: { type: true },
      orderBy: { dateDepot: 'desc' },
    });

    // Formatter la réponse avec le nom du type
    return justificatifs.map(j => ({
      id: j.id,
      typeId: j.typeId,
      nomType: j.type.nom,
      fichierUrl: j.fichierUrl,
      valide: j.valide,
      dateDepot: j.dateDepot,
    }));
  }

  async upload(enfantId: number, typeId: number, fichierUrl: string, user: UserPayload) {
    // Vérifier que l'utilisateur a accès à cet enfant
    await this.verifyEnfantOwnership(enfantId, user);

    return this.prisma.justificatif.create({
      data: {
        enfantId,
        typeId,
        fichierUrl,
        dateDepot: new Date(),
        valide: null, // En attente de validation
      },
    });
  }

  async valider(id: number, valide: boolean, commentaire?: string) {
    const justificatif = await this.prisma.justificatif.findUnique({
      where: { id },
      include: { enfant: true },
    });

    if (!justificatif) {
      throw new NotFoundException('Justificatif non trouvé');
    }

    const updated = await this.prisma.justificatif.update({
      where: { id },
      data: {
        valide,
        // On pourrait ajouter dateValidation et commentaireValidation si dans le schéma
      },
    });

    // Si validation acceptée, vérifier si tous les documents sont complets
    if (valide) {
      await this.checkAndCreateInscription(justificatif.enfantId);
    }

    return updated;
  }

  /**
   * Vérifie si tous les documents obligatoires sont validés et crée l'inscription
   */
  private async checkAndCreateInscription(enfantId: number): Promise<void> {
    // Récupérer l'enfant avec ses parents
    const enfant = await this.prisma.enfant.findUnique({
      where: { id: enfantId },
      include: { parent1: true, parent2: true },
    });

    if (!enfant) return;

    // Vérifier s'il y a déjà une inscription active pour cette année
    const anneeScolaire = this.getAnneeScolaireActuelle();
    const inscriptionExistante = await this.prisma.inscription.findFirst({
      where: {
        enfantId,
        anneeScolaire,
        statut: StatutInscription.ACTIVE,
      },
    });

    if (inscriptionExistante) {
      this.logger.debug(`Inscription déjà existante pour enfant #${enfantId}`);
      return;
    }

    // Récupérer les types de justificatifs obligatoires (sauf règlement intérieur)
    const typesObligatoires = await this.prisma.justificatifAttendu.findMany({
      where: {
        obligatoire: true,
        NOT: { nom: { contains: 'Règlement', mode: 'insensitive' } },
      },
    });

    // Récupérer les justificatifs validés de l'enfant
    const justificatifsValides = await this.prisma.justificatif.findMany({
      where: {
        enfantId,
        valide: true,
      },
    });

    const typeIdsValides = new Set(justificatifsValides.map(j => j.typeId));

    // Vérifier que chaque type obligatoire a un justificatif validé
    const tousJustificatifsValides = typesObligatoires.every(type =>
      typeIdsValides.has(type.id)
    );

    if (!tousJustificatifsValides) {
      this.logger.debug(`Justificatifs incomplets pour enfant #${enfantId}`);
      return;
    }

    // Vérifier que le règlement intérieur est signé
    const signatureReglement = await this.prisma.signatureReglement.findFirst({
      where: { enfantId },
    });

    if (!signatureReglement) {
      this.logger.debug(`Règlement non signé pour enfant #${enfantId}`);
      return;
    }

    // Tous les documents sont validés + règlement signé → créer l'inscription
    await this.prisma.inscription.create({
      data: {
        enfantId,
        parentId: enfant.parent1Id,
        dateInscription: new Date(),
        statut: StatutInscription.ACTIVE,
        anneeScolaire,
        commentaires: 'Inscription finalisée automatiquement (tous documents validés)',
      },
    });

    this.logger.log(`✅ Inscription ACTIVE créée pour ${enfant.prenom} ${enfant.nom} (${anneeScolaire})`);
  }

  /**
   * Calcule l'année scolaire actuelle (ex: "2025-2026")
   */
  private getAnneeScolaireActuelle(): string {
    const now = new Date();
    const mois = now.getMonth();
    const annee = now.getFullYear();

    // Septembre à décembre → année en cours - année suivante
    // Janvier à août → année précédente - année en cours
    if (mois >= 8) {
      return `${annee}-${annee + 1}`;
    }
    return `${annee - 1}-${annee}`;
  }

  async remove(id: number, user: UserPayload) {
    const justificatif = await this.prisma.justificatif.findUnique({
      where: { id },
      select: { enfantId: true },
    });

    if (!justificatif) {
      throw new NotFoundException('Justificatif non trouvé');
    }

    // Vérifier que l'utilisateur a accès à cet enfant
    await this.verifyEnfantOwnership(justificatif.enfantId, user);

    return this.prisma.justificatif.delete({ where: { id } });
  }

  async getJustificatifsEnAttente() {
    return this.prisma.justificatif.findMany({
      where: { valide: null },
      include: {
        type: true,
        enfant: {
          select: { id: true, nom: true, prenom: true, classe: true },
        },
      },
      orderBy: { dateDepot: 'asc' },
    });
  }
}

