import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { isBefore, startOfDay } from 'date-fns';

@Injectable()
export class PeriscolaireService {
  constructor(private prisma: PrismaService) {}

  async inscrire(enfantId: number, date: string) {
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

  async inscrireMultiple(enfantId: number, dates: string[]) {
    const results = [];
    for (const date of dates) {
      try {
        const periscolaire = await this.inscrire(enfantId, date);
        results.push({ date, success: true, periscolaire });
      } catch (error) {
        results.push({ date, success: false, error: (error as Error).message });
      }
    }
    return results;
  }

  async annuler(id: number) {
    const periscolaire = await this.prisma.periscolaire.findUnique({
      where: { id },
    });

    if (!periscolaire) {
      throw new NotFoundException('Inscription périscolaire non trouvée');
    }

    return this.prisma.periscolaire.delete({ where: { id } });
  }

  async getPeriscolaireEnfant(enfantId: number, mois?: string) {
    const where: any = { enfantId };

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

