import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private prisma: PrismaService) {}

  private async verifierParente(enfantId: number, parentId: number) {
    const enfant = await this.prisma.enfant.findUnique({
      where: { id: enfantId },
      select: { parent1Id: true, parent2Id: true },
    });
    if (!enfant || (enfant.parent1Id !== parentId && enfant.parent2Id !== parentId)) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à agir sur cet enfant');
    }
  }

  /**
   * Enregistrer l'ouverture du règlement intérieur
   */
  async enregistrerOuverture(
    parentId: number,
    enfantId: number,
    pdfType: string,
    ipAddress: string,
    userAgent: string,
  ) {
    await this.verifierParente(enfantId, parentId);

    // Vérifier si déjà enregistré
    const existing = await this.prisma.pdfOuverture.findFirst({
      where: {
        parentId,
        enfantId,
        pdfType,
      },
    });

    if (existing) {
      return { opened: true, dateOuverture: existing.openedAt };
    }

    // Créer l'enregistrement
    const ouverture = await this.prisma.pdfOuverture.create({
      data: {
        parentId,
        enfantId,
        pdfType,
        openedAt: new Date(),
        ipAddress,
        userAgent,
      },
    });

    this.logger.log(`PDF ouvert par parent ${parentId} pour enfant/dossier ${enfantId}`);

    return { opened: true, dateOuverture: ouverture.openedAt };
  }

  /**
   * Vérifier si le règlement a été ouvert
   */
  async verifierOuverture(parentId: number, enfantId: number, pdfType: string = 'reglement-interieur') {
    await this.verifierParente(enfantId, parentId);

    const ouverture = await this.prisma.pdfOuverture.findFirst({
      where: {
        parentId,
        enfantId,
        pdfType,
      },
    });

    return {
      opened: !!ouverture,
      dateOuverture: ouverture?.openedAt || null,
    };
  }
}

