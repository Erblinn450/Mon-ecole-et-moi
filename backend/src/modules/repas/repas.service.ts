import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TypeRepas } from '@prisma/client';
import { addWeeks, isBefore, startOfDay } from 'date-fns';

@Injectable()
export class RepasService {
  constructor(private prisma: PrismaService) {}

  private async verifierParente(enfantId: number, userId: number, isAdmin: boolean) {
    if (isAdmin) return;
    const enfant = await this.prisma.enfant.findUnique({ where: { id: enfantId } });
    if (!enfant || (enfant.parent1Id !== userId && enfant.parent2Id !== userId)) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à agir sur cet enfant');
    }
  }

  async commander(enfantId: number, date: string, userId: number, isAdmin: boolean, type: TypeRepas = 'MIDI') {
    await this.verifierParente(enfantId, userId, isAdmin);

    const dateRepas = new Date(date);

    if (isBefore(startOfDay(dateRepas), startOfDay(new Date()))) {
      throw new BadRequestException('Impossible de commander pour une date passée');
    }

    const existing = await this.prisma.repas.findFirst({
      where: { enfantId, dateRepas, type },
    });

    if (existing) {
      throw new BadRequestException('Un repas est déjà commandé pour cette date');
    }

    return this.prisma.repas.create({
      data: {
        enfantId,
        dateRepas,
        type,
        valide: true,
      },
    });
  }

  async commanderMultiple(enfantId: number, dates: string[], userId: number, isAdmin: boolean, type: TypeRepas = 'MIDI') {
    await this.verifierParente(enfantId, userId, isAdmin);

    const results = [];
    for (const date of dates) {
      try {
        const repas = await this.commander(enfantId, date, userId, isAdmin, type);
        results.push({ date, success: true, repas });
      } catch (error) {
        results.push({ date, success: false, error: (error as Error).message });
      }
    }
    return results;
  }

  async annuler(id: number, userId: number, isAdmin: boolean) {
    const repas = await this.prisma.repas.findUnique({
      where: { id },
    });

    if (!repas) {
      throw new NotFoundException('Repas non trouvé');
    }

    if (!isAdmin) {
      const enfant = await this.prisma.enfant.findUnique({
        where: { id: repas.enfantId },
      });

      if (!enfant || (enfant.parent1Id !== userId && enfant.parent2Id !== userId)) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à annuler ce repas');
      }

      const limiteAnnulation = addWeeks(new Date(), 1);
      if (isBefore(repas.dateRepas, limiteAnnulation)) {
        throw new BadRequestException(
          'Annulation impossible : le repas doit être annulé au moins 1 semaine à l\'avance'
        );
      }
    }

    return this.prisma.repas.delete({ where: { id } });
  }

  async getRepasEnfant(enfantId: number, userId: number, isAdmin: boolean, mois?: string) {
    await this.verifierParente(enfantId, userId, isAdmin);

    const where: Record<string, unknown> = { enfantId };

    if (mois) {
      const [year, month] = mois.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.dateRepas = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.repas.findMany({
      where,
      orderBy: { dateRepas: 'asc' },
    });
  }

  async getRepasParDate(date: string) {
    const dateRepas = new Date(date);

    return this.prisma.repas.findMany({
      where: { dateRepas },
      include: {
        enfant: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            classe: true,
          },
        },
      },
      orderBy: [
        { enfant: { classe: 'asc' } },
        { enfant: { nom: 'asc' } },
      ],
    });
  }

  async getEnfantsNonInscrits(date: string) {
    const dateRepas = new Date(date);

    const enfantsInscrits = await this.prisma.repas.findMany({
      where: { dateRepas },
      select: { enfantId: true },
    });

    const idsInscrits = enfantsInscrits.map(r => r.enfantId);

    return this.prisma.enfant.findMany({
      where: {
        id: { notIn: idsInscrits },
        classe: { not: null },
      },
      include: {
        parent1: { select: { name: true, email: true, telephone: true } },
      },
      orderBy: [{ classe: 'asc' }, { nom: 'asc' }],
    });
  }

  async getStatsRepas(mois: string) {
    const [year, month] = mois.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const repas = await this.prisma.repas.findMany({
      where: {
        dateRepas: { gte: startDate, lte: endDate },
      },
      include: {
        enfant: { select: { classe: true } },
      },
    });

    const parClasse = repas.reduce((acc, r) => {
      const classe = r.enfant.classe || 'NON_AFFECTE';
      acc[classe] = (acc[classe] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: repas.length,
      parClasse,
      periode: mois,
    };
  }
}
