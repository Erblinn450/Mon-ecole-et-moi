import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

interface UserPayload {
  id: number;
  email: string;
  role: Role;
}

@Injectable()
export class JustificatifsService {
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
    });

    if (!justificatif) {
      throw new NotFoundException('Justificatif non trouvé');
    }

    return this.prisma.justificatif.update({
      where: { id },
      data: {
        valide,
        // On pourrait ajouter dateValidation et commentaireValidation si dans le schéma
      },
    });
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

