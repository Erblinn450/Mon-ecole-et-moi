import { Injectable, Logger, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { CreateReinscriptionDto } from './dto/create-reinscription.dto';
import { StatutReinscription, Role } from '@prisma/client';

@Injectable()
export class ReinscriptionsService {
  private readonly logger = new Logger(ReinscriptionsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Calcule l'année scolaire prochaine (ex: "2026-2027")
   */
  private getAnneeScolaireProchaine(): string {
    const now = new Date();
    const mois = now.getMonth();
    const annee = now.getFullYear();

    // Si on est entre septembre et décembre, l'année prochaine est année+1 - année+2
    // Sinon (janvier à août), c'est année - année+1
    if (mois >= 8) {
      return `${annee + 1}-${annee + 2}`;
    }
    return `${annee}-${annee + 1}`;
  }

  /**
   * Récupère les enfants d'un parent éligibles à la réinscription
   */
  async getEnfantsEligibles(parentId: number) {
    const anneeScolaire = this.getAnneeScolaireProchaine();

    // Récupérer les enfants du parent qui ont une inscription active
    const enfants = await this.prisma.enfant.findMany({
      where: {
        deletedAt: null,
        OR: [
          { parent1Id: parentId },
          { parent2Id: parentId },
        ],
      },
      include: {
        inscriptions: {
          where: { statut: 'ACTIVE' },
          orderBy: { dateInscription: 'desc' },
          take: 1,
        },
        // Vérifier si une réinscription existe déjà pour cette année
        // Prisma ne supporte pas les relations non définies, on le fera manuellement
      },
    });

    // Filtrer les enfants qui n'ont pas déjà de réinscription pour cette année
    const enfantsAvecStatut = await Promise.all(
      enfants.map(async (enfant) => {
        const reinscriptionExistante = await this.prisma.reinscription.findUnique({
          where: {
            enfantId_anneeScolaire: {
              enfantId: enfant.id,
              anneeScolaire,
            },
          },
        });

        return {
          id: enfant.id,
          nom: enfant.nom,
          prenom: enfant.prenom,
          dateNaissance: enfant.dateNaissance,
          classe: enfant.classe,
          inscriptionActive: enfant.inscriptions.length > 0,
          reinscriptionStatut: reinscriptionExistante?.statut || null,
          reinscriptionId: reinscriptionExistante?.id || null,
        };
      })
    );

    return {
      anneeScolaire,
      enfants: enfantsAvecStatut,
    };
  }

  /**
   * Crée une demande de réinscription
   */
  async create(dto: CreateReinscriptionDto, parentId: number) {
    const anneeScolaire = this.getAnneeScolaireProchaine();

    // Vérifier que l'enfant appartient bien au parent
    const enfant = await this.prisma.enfant.findFirst({
      where: {
        id: dto.enfantId,
        deletedAt: null,
        OR: [
          { parent1Id: parentId },
          { parent2Id: parentId },
        ],
      },
      include: {
        parent1: true,
        parent2: true,
      },
    });

    if (!enfant) {
      throw new ForbiddenException('Cet enfant ne vous appartient pas');
    }

    // Vérifier qu'une réinscription n'existe pas déjà
    const existante = await this.prisma.reinscription.findUnique({
      where: {
        enfantId_anneeScolaire: {
          enfantId: dto.enfantId,
          anneeScolaire,
        },
      },
    });

    if (existante) {
      throw new BadRequestException('Une demande de réinscription existe déjà pour cet enfant');
    }

    // Créer la réinscription
    const reinscription = await this.prisma.reinscription.create({
      data: {
        enfantId: dto.enfantId,
        parentId,
        anneeScolaire,
        classeActuelle: enfant.classe,
        classeSouhaitee: dto.classeSouhaitee,
        statut: StatutReinscription.EN_ATTENTE,
      },
    });

    this.logger.log(`✅ Réinscription créée pour ${enfant.prenom} ${enfant.nom} (${anneeScolaire})`);

    return reinscription;
  }

  /**
   * Crée plusieurs réinscriptions en une fois
   */
  async createBulk(reinscriptions: CreateReinscriptionDto[], parentId: number) {
    const results = [];

    for (const dto of reinscriptions) {
      try {
        const result = await this.create(dto, parentId);
        results.push({ enfantId: dto.enfantId, success: true, reinscription: result });
      } catch (error) {
        results.push({ enfantId: dto.enfantId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Récupère toutes les réinscriptions (admin)
   */
  async findAll(anneeScolaire?: string) {
    const where = anneeScolaire ? { anneeScolaire } : {};

    return this.prisma.reinscription.findMany({
      where,
      include: {
        enfant: {
          include: {
            parent1: true,
          },
        },
      },
      orderBy: { dateDemande: 'desc' },
    });
  }

  /**
   * Récupère les réinscriptions d'un parent
   */
  async findByParent(parentId: number) {
    return this.prisma.reinscription.findMany({
      where: { parentId },
      orderBy: { dateDemande: 'desc' },
    });
  }

  /**
   * Met à jour le statut d'une réinscription (admin)
   */
  async updateStatut(id: number, statut: StatutReinscription, commentaire?: string) {
    const reinscription = await this.prisma.reinscription.findUnique({
      where: { id },
    });

    if (!reinscription) {
      throw new NotFoundException('Réinscription non trouvée');
    }

    const updated = await this.prisma.reinscription.update({
      where: { id },
      data: {
        statut,
        commentaire,
        dateTraitement: new Date(),
      },
    });

    // Si validée, créer/mettre à jour l'inscription pour l'année prochaine
    if (statut === StatutReinscription.VALIDEE) {
      await this.validerReinscription(reinscription);
    }

    this.logger.log(`📝 Réinscription #${id} mise à jour: ${statut}`);

    return updated;
  }

  /**
   * Valide une réinscription et crée l'inscription
   */
  private async validerReinscription(reinscription: any) {
    // Créer une nouvelle inscription pour l'année scolaire
    await this.prisma.inscription.create({
      data: {
        enfantId: reinscription.enfantId,
        parentId: reinscription.parentId,
        dateInscription: new Date(),
        statut: 'ACTIVE',
        anneeScolaire: reinscription.anneeScolaire,
        commentaires: 'Réinscription validée',
      },
    });

    // Mettre à jour la classe de l'enfant si une classe souhaitée a été spécifiée
    if (reinscription.classeSouhaitee) {
      // Note: On ne met pas à jour la classe directement car c'est un enum
      // et la classe souhaitée peut être "CP", "CE1", etc.
      // L'admin devra le faire manuellement si nécessaire
    }

    this.logger.log(`✅ Inscription créée pour l'année ${reinscription.anneeScolaire}`);
  }

  /**
   * Statistiques des réinscriptions (admin)
   */
  async getStats(anneeScolaire?: string) {
    const annee = anneeScolaire || this.getAnneeScolaireProchaine();

    const [total, enAttente, validees, refusees] = await Promise.all([
      this.prisma.reinscription.count({ where: { anneeScolaire: annee } }),
      this.prisma.reinscription.count({ where: { anneeScolaire: annee, statut: 'EN_ATTENTE' } }),
      this.prisma.reinscription.count({ where: { anneeScolaire: annee, statut: 'VALIDEE' } }),
      this.prisma.reinscription.count({ where: { anneeScolaire: annee, statut: 'REFUSEE' } }),
    ]);

    return {
      anneeScolaire: annee,
      total,
      enAttente,
      validees,
      refusees,
    };
  }
}
