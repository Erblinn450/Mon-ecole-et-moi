import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { isBefore, startOfDay } from 'date-fns';

@Injectable()
export class PeriscolaireService {
  constructor(private prisma: PrismaService) {}

  private async verifierParente(enfantId: number, userId: number, isAdmin: boolean) {
    if (isAdmin) return;
    const enfant = await this.prisma.enfant.findUnique({ where: { id: enfantId } });
    if (!enfant || (enfant.parent1Id !== userId && enfant.parent2Id !== userId)) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à agir sur cet enfant');
    }
  }

  async inscrire(enfantId: number, date: string, userId: number, isAdmin: boolean) {
    await this.verifierParente(enfantId, userId, isAdmin);
    const datePeriscolaire = new Date(date);

    if (isBefore(startOfDay(datePeriscolaire), startOfDay(new Date()))) {
      throw new BadRequestException('Impossible de s\'inscrire pour une date passée');
    }

    const existing = await this.prisma.periscolaire.findFirst({
      where: { enfantId, datePeriscolaire },
    });

    if (existing) {
      throw new BadRequestException('Déjà inscrit pour cette date');
    }

    return this.prisma.periscolaire.create({
      data: { enfantId, datePeriscolaire },
    });
  }

  async inscrireMultiple(enfantId: number, dates: string[], userId: number, isAdmin: boolean) {
    await this.verifierParente(enfantId, userId, isAdmin);
    const results = [];
    for (const date of dates) {
      try {
        const periscolaire = await this.inscrire(enfantId, date, userId, isAdmin);
        results.push({ date, success: true, periscolaire });
      } catch (error) {
        results.push({ date, success: false, error: (error as Error).message });
      }
    }
    return results;
  }

  async annuler(id: number, userId: number, isAdmin: boolean) {
    const periscolaire = await this.prisma.periscolaire.findUnique({
      where: { id },
    });

    if (!periscolaire) {
      throw new NotFoundException('Inscription périscolaire non trouvée');
    }

    await this.verifierParente(periscolaire.enfantId, userId, isAdmin);

    return this.prisma.periscolaire.delete({ where: { id } });
  }

  async getPeriscolaireEnfant(enfantId: number, userId: number, isAdmin: boolean, mois?: string) {
    await this.verifierParente(enfantId, userId, isAdmin);
    const where: Prisma.PeriscolaireWhereInput = { enfantId };

    if (mois) {
      const [year, month] = mois.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.datePeriscolaire = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.periscolaire.findMany({
      where,
      orderBy: { datePeriscolaire: 'asc' },
    });
  }

  async getPeriscolaireParDate(date: string) {
    const datePeriscolaire = new Date(date);
    
    return this.prisma.periscolaire.findMany({
      where: { datePeriscolaire },
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
    const datePeriscolaire = new Date(date);
    
    const enfantsInscrits = await this.prisma.periscolaire.findMany({
      where: { datePeriscolaire },
      select: { enfantId: true },
    });

    const idsInscrits = enfantsInscrits.map(p => p.enfantId);

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
}

