import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JustificatifsService {
  constructor(private prisma: PrismaService) {}

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

  async getJustificatifsEnfant(enfantId: number) {
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

  async upload(enfantId: number, typeId: number, fichierUrl: string) {
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

  async remove(id: number) {
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

