import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonneAutoriseeDto } from './dto/create-personne-autorisee.dto';
import { UpdatePersonneAutoriseeDto } from './dto/update-personne-autorisee.dto';

@Injectable()
export class PersonnesAutoriseesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vérifie que l'utilisateur est bien parent de l'enfant
   */
  private async verifyParentAccess(userId: number, enfantId: number): Promise<void> {
    const enfant = await this.prisma.enfant.findFirst({
      where: {
        id: enfantId,
        deletedAt: null,
        OR: [{ parent1Id: userId }, { parent2Id: userId }],
      },
    });

    if (!enfant) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à gérer cet enfant");
    }
  }

  /**
   * Créer une personne autorisée
   */
  async create(userId: number, dto: CreatePersonneAutoriseeDto) {
    await this.verifyParentAccess(userId, dto.enfantId);

    return this.prisma.personneAutorisee.create({
      data: {
        enfantId: dto.enfantId,
        nom: dto.nom,
        prenom: dto.prenom,
        telephone: dto.telephone,
        lienParente: dto.lienParente,
      },
    });
  }

  /**
   * Récupérer les personnes autorisées pour un enfant
   */
  async findByEnfant(userId: number, enfantId: number) {
    await this.verifyParentAccess(userId, enfantId);

    return this.prisma.personneAutorisee.findMany({
      where: { enfantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupérer toutes les personnes autorisées pour tous les enfants d'un parent
   */
  async findAllForParent(userId: number) {
    const enfants = await this.prisma.enfant.findMany({
      where: {
        deletedAt: null,
        OR: [{ parent1Id: userId }, { parent2Id: userId }],
      },
      include: {
        personnesAutorisees: true,
      },
    });

    return enfants.map((e) => ({
      enfantId: e.id,
      enfantNom: `${e.prenom} ${e.nom}`,
      personnesAutorisees: e.personnesAutorisees,
    }));
  }

  /**
   * Mettre à jour une personne autorisée
   */
  async update(userId: number, id: number, dto: UpdatePersonneAutoriseeDto) {
    const personne = await this.prisma.personneAutorisee.findUnique({
      where: { id },
    });

    if (!personne) {
      throw new NotFoundException('Personne autorisée non trouvée');
    }

    await this.verifyParentAccess(userId, personne.enfantId);

    return this.prisma.personneAutorisee.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Supprimer une personne autorisée
   */
  async remove(userId: number, id: number) {
    const personne = await this.prisma.personneAutorisee.findUnique({
      where: { id },
    });

    if (!personne) {
      throw new NotFoundException('Personne autorisée non trouvée');
    }

    await this.verifyParentAccess(userId, personne.enfantId);

    return this.prisma.personneAutorisee.delete({
      where: { id },
    });
  }
}
