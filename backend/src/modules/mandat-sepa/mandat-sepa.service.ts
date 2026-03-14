import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SignerMandatDto } from './dto/signer-mandat.dto';

@Injectable()
export class MandatSepaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Génère une Référence Unique de Mandat (RUM).
   * Format : MEMM-YYYY-NNNNN (ex: MEMM-2026-00001)
   */
  private async generateRUM(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MEMM-${year}-`;

    return this.prisma.$transaction(async (tx) => {
      // Verrouillage séquentiel pour éviter les doublons
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(200)`;

      const lastMandat = await tx.mandatSepa.findFirst({
        where: { rum: { startsWith: prefix } },
        orderBy: { rum: 'desc' },
        select: { rum: true },
      });

      let nextNumber = 1;
      if (lastMandat) {
        const lastNum = parseInt(lastMandat.rum.replace(prefix, ''), 10);
        if (!isNaN(lastNum)) {
          nextNumber = lastNum + 1;
        }
      }

      return `${prefix}${String(nextNumber).padStart(5, '0')}`;
    });
  }

  /**
   * Signer un mandat SEPA (parent authentifié).
   * 1 mandat actif par parent maximum.
   */
  async signerMandat(
    dto: SignerMandatDto,
    parentId: number,
    ipAdresse: string,
  ) {
    // Vérifier si un mandat actif existe déjà
    const mandatActif = await this.prisma.mandatSepa.findFirst({
      where: { parentId, actif: true },
    });

    if (mandatActif) {
      throw new BadRequestException(
        'Un mandat SEPA actif existe déjà. Révoquez-le avant d\'en signer un nouveau.',
      );
    }

    // Nettoyer l'IBAN (supprimer les espaces)
    const ibanClean = dto.iban.replace(/\s/g, '');

    const rum = await this.generateRUM();

    const mandat = await this.prisma.mandatSepa.create({
      data: {
        parentId,
        rum,
        iban: ibanClean,
        bic: dto.bic,
        titulaire: dto.titulaire,
        signatureData: dto.signatureData,
        dateSignature: new Date(),
        ipAdresse,
      },
    });

    return {
      message: 'Mandat SEPA signé avec succès',
      mandat: {
        id: mandat.id,
        rum: mandat.rum,
        iban: this.masquerIBAN(mandat.iban),
        bic: mandat.bic,
        titulaire: mandat.titulaire,
        dateSignature: mandat.dateSignature,
        actif: mandat.actif,
      },
    };
  }

  /**
   * Récupérer le mandat actif du parent connecté.
   */
  async getMonMandat(parentId: number) {
    const mandat = await this.prisma.mandatSepa.findFirst({
      where: { parentId, actif: true },
    });

    if (!mandat) {
      return { mandat: null };
    }

    return {
      mandat: {
        id: mandat.id,
        rum: mandat.rum,
        iban: this.masquerIBAN(mandat.iban),
        bic: mandat.bic,
        titulaire: mandat.titulaire,
        dateSignature: mandat.dateSignature,
        actif: mandat.actif,
      },
    };
  }

  /**
   * Révoquer le mandat actif du parent.
   */
  async revoquerMandat(mandatId: number, parentId: number) {
    const mandat = await this.prisma.mandatSepa.findUnique({
      where: { id: mandatId },
    });

    if (!mandat) {
      throw new NotFoundException('Mandat non trouvé');
    }

    if (mandat.parentId !== parentId) {
      throw new ForbiddenException('Accès refusé');
    }

    if (!mandat.actif) {
      throw new BadRequestException('Ce mandat est déjà révoqué');
    }

    const updated = await this.prisma.mandatSepa.update({
      where: { id: mandatId },
      data: {
        actif: false,
        dateRevocation: new Date(),
      },
    });

    return {
      message: 'Mandat SEPA révoqué',
      mandat: {
        id: updated.id,
        rum: updated.rum,
        actif: updated.actif,
        dateRevocation: updated.dateRevocation,
      },
    };
  }

  // ========== ADMIN ==========

  /**
   * Liste tous les mandats (Admin).
   */
  async getAllMandats() {
    return this.prisma.mandatSepa.findMany({
      include: {
        parent: {
          select: { id: true, nom: true, prenom: true, email: true, telephone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Détail d'un mandat (Admin) — inclut l'IBAN complet.
   */
  async getMandatById(mandatId: number) {
    const mandat = await this.prisma.mandatSepa.findUnique({
      where: { id: mandatId },
      include: {
        parent: {
          select: { id: true, nom: true, prenom: true, email: true, telephone: true, adresse: true },
        },
      },
    });

    if (!mandat) {
      throw new NotFoundException('Mandat non trouvé');
    }

    return mandat;
  }

  /**
   * Modifier l'IBAN/BIC d'un mandat (Admin).
   */
  async updateMandatAdmin(
    mandatId: number,
    data: { iban?: string; bic?: string; titulaire?: string },
  ) {
    const mandat = await this.prisma.mandatSepa.findUnique({
      where: { id: mandatId },
    });

    if (!mandat) {
      throw new NotFoundException('Mandat non trouvé');
    }

    const updateData: any = {};
    if (data.iban) updateData.iban = data.iban.replace(/\s/g, '');
    if (data.bic) updateData.bic = data.bic;
    if (data.titulaire) updateData.titulaire = data.titulaire;

    return this.prisma.mandatSepa.update({
      where: { id: mandatId },
      data: updateData,
    });
  }

  /**
   * Masquer l'IBAN pour l'affichage (sécurité).
   * FR76 3000 6000 0112 3456 7890 189 → FR76 **** **** **** **** **90 189
   */
  private masquerIBAN(iban: string): string {
    if (iban.length <= 8) return iban;
    const start = iban.substring(0, 4);
    const end = iban.substring(iban.length - 6);
    const middle = '*'.repeat(iban.length - 10);
    return `${start} ${middle} ${end}`;
  }
}
