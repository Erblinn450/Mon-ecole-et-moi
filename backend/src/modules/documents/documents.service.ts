import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private prisma: PrismaService) {}

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

