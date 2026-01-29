import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Classe } from '@prisma/client';

@Injectable()
export class EnfantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(classe?: Classe) {
    const where = classe ? { classe } : {};
    
    return this.prisma.enfant.findMany({
      where,
      include: {
        parent1: {
          select: { id: true, name: true, email: true, telephone: true },
        },
        parent2: {
          select: { id: true, name: true, email: true, telephone: true },
        },
      },
      orderBy: [{ classe: 'asc' }, { nom: 'asc' }],
    });
  }

  async findOne(id: number) {
    const enfant = await this.prisma.enfant.findUnique({
      where: { id },
      include: {
        parent1: {
          select: { id: true, name: true, nom: true, prenom: true, email: true, telephone: true },
        },
        parent2: {
          select: { id: true, name: true, nom: true, prenom: true, email: true, telephone: true },
        },
        inscriptions: true,
        repas: {
          orderBy: { dateRepas: 'desc' },
          take: 30,
        },
        periscolaires: {
          orderBy: { datePeriscolaire: 'desc' },
          take: 30,
        },
        justificatifs: {
          include: { type: true },
        },
        signatureReglements: true,
      },
    });

    if (!enfant) {
      throw new NotFoundException('Enfant non trouvé');
    }

    return enfant;
  }

  async findByParent(parentId: number) {
    return this.prisma.enfant.findMany({
      where: {
        OR: [
          { parent1Id: parentId },
          { parent2Id: parentId },
        ],
      },
      include: {
        inscriptions: {
          where: { statut: 'ACTIVE' },
        },
        signatureReglements: true,
      },
    });
  }

  async create(data: {
    nom: string;
    prenom: string;
    dateNaissance?: Date;
    lieuNaissance?: string;
    classe?: Classe;
    parent1Id: number;
    parent2Id?: number;
  }) {
    return this.prisma.enfant.create({
      data,
      include: {
        parent1: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: number, data: Partial<{
    nom: string;
    prenom: string;
    dateNaissance: Date;
    lieuNaissance: string;
    classe: Classe;
  }>) {
    await this.findOne(id);
    return this.prisma.enfant.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.enfant.delete({ where: { id } });
  }

  async getByClasse(classe: Classe) {
    return this.prisma.enfant.findMany({
      where: { classe },
      include: {
        parent1: { select: { id: true, name: true, email: true, telephone: true } },
      },
      orderBy: { nom: 'asc' },
    });
  }

  async getStats() {
    const [total, maternelle, elementaire, college] = await Promise.all([
      this.prisma.enfant.count(),
      this.prisma.enfant.count({ where: { classe: 'MATERNELLE' } }),
      this.prisma.enfant.count({ where: { classe: 'ELEMENTAIRE' } }),
      this.prisma.enfant.count({ where: { classe: 'COLLEGE' } }),
    ]);

    return { total, maternelle, elementaire, college };
  }
}

