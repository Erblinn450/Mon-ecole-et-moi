import { Injectable, Logger, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { CreateReinscriptionDto } from './dto/create-reinscription.dto';
import { StatutReinscription, StatutInscription, Classe } from '@prisma/client';

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
          where: { statut: StatutInscription.ACTIVE },
          orderBy: { dateInscription: 'desc' },
          take: 1,
        },
      },
    });

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

    this.logger.log(`Réinscription créée pour ${enfant.prenom} ${enfant.nom} (${anneeScolaire})`);

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
            parent2: true,
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
      include: {
        enfant: {
          include: {
            parent1: true,
            parent2: true,
          },
        },
      },
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

    // Envoyer email au parent
    const parent = reinscription.enfant?.parent1 || reinscription.enfant?.parent2;
    if (parent) {
      const emailData = {
        emailParent: parent.email,
        nomParent: parent.nom || parent.name || '',
        prenomParent: parent.prenom || '',
        nomEnfant: reinscription.enfant.nom,
        prenomEnfant: reinscription.enfant.prenom,
        anneeScolaire: reinscription.anneeScolaire,
      };

      try {
        if (statut === StatutReinscription.VALIDEE) {
          await this.emailService.sendReinscriptionValidated({
            ...emailData,
            classeSouhaitee: reinscription.classeSouhaitee,
          });
        } else if (statut === StatutReinscription.REFUSEE) {
          await this.emailService.sendReinscriptionRefused({
            ...emailData,
            commentaire,
          });
        }
      } catch (error) {
        this.logger.error(`Erreur envoi email réinscription: ${error.message}`);
      }
    }

    this.logger.log(`Réinscription #${id} mise à jour: ${statut}`);

    return updated;
  }

  /**
   * Valide une réinscription et crée l'inscription
   */
  private async validerReinscription(reinscription: {
    enfantId: number;
    parentId: number;
    anneeScolaire: string;
    classeSouhaitee?: string | null;
  }) {
    // Vérifier qu'une inscription n'existe pas déjà pour cet enfant et cette année
    const inscriptionExistante = await this.prisma.inscription.findFirst({
      where: {
        enfantId: reinscription.enfantId,
        anneeScolaire: reinscription.anneeScolaire,
      },
    });

    if (!inscriptionExistante) {
      // Créer une nouvelle inscription pour l'année scolaire
      await this.prisma.inscription.create({
        data: {
          enfantId: reinscription.enfantId,
          parentId: reinscription.parentId,
          dateInscription: new Date(),
          statut: StatutInscription.ACTIVE,
          anneeScolaire: reinscription.anneeScolaire,
          commentaires: 'Réinscription validée',
        },
      });
      this.logger.log(`Inscription créée pour l'année ${reinscription.anneeScolaire}`);
    } else {
      this.logger.log(`Inscription existante trouvée pour l'année ${reinscription.anneeScolaire} - pas de doublon`);
    }

    // Mettre à jour la classe de l'enfant si une classe souhaitée a été spécifiée
    if (reinscription.classeSouhaitee) {
      const validClasses: string[] = Object.values(Classe);
      if (validClasses.includes(reinscription.classeSouhaitee)) {
        await this.prisma.enfant.update({
          where: { id: reinscription.enfantId },
          data: { classe: reinscription.classeSouhaitee as Classe },
        });
        this.logger.log(`Classe de l'enfant mise à jour: ${reinscription.classeSouhaitee}`);
      }
    }
  }

  /**
   * Statistiques des réinscriptions (admin)
   */
  async getStats(anneeScolaire?: string) {
    const annee = anneeScolaire || this.getAnneeScolaireProchaine();

    const [total, enAttente, validees, refusees] = await Promise.all([
      this.prisma.reinscription.count({ where: { anneeScolaire: annee } }),
      this.prisma.reinscription.count({ where: { anneeScolaire: annee, statut: StatutReinscription.EN_ATTENTE } }),
      this.prisma.reinscription.count({ where: { anneeScolaire: annee, statut: StatutReinscription.VALIDEE } }),
      this.prisma.reinscription.count({ where: { anneeScolaire: annee, statut: StatutReinscription.REFUSEE } }),
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
