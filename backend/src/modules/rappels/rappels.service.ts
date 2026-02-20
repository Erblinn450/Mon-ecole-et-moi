import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { StatutInscription, type Enfant } from '@prisma/client';

interface ParentInfo {
  id: number;
  name: string;
  email: string;
  prenom: string | null;
}
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RappelsService {
  private readonly logger = new Logger(RappelsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Vérifie chaque jour si on est en septembre et envoie les rappels d'attestation RC
   * Cron: tous les jours à 9h
   */
  @Cron('0 9 * * *', {
    name: 'rappel-attestation-rc',
    timeZone: 'Europe/Paris',
  })
  async verifierEtEnvoyerRappelsAttestationRC() {
    const now = new Date();
    const mois = now.getMonth(); // 0-11 (8 = septembre)
    const jour = now.getDate();

    // Vérifier si on est en septembre (mois 8)
    if (mois !== 8) {
      return; // Pas en septembre, ne rien faire
    }

    // Envoyer uniquement le 1er septembre
    if (jour !== 1) {
      return;
    }

    this.logger.log('Début de l\'envoi des rappels d\'attestation de responsabilité civile (septembre)');

    try {
      // Récupérer tous les enfants actifs (ceux qui ont une inscription active)
      const enfants = await this.prisma.enfant.findMany({
        where: {
          deletedAt: null,
          inscriptions: {
            some: {
              statut: StatutInscription.ACTIVE,
            },
          },
        },
        include: {
          parent1: { select: { id: true, name: true, email: true } },
          parent2: { select: { id: true, name: true, email: true } },
          justificatifs: {
            where: {
              type: {
                nom: 'Attestation de responsabilité civile',
              },
            },
            orderBy: {
              dateDepot: 'desc',
            },
            take: 1,
          },
        },
      });

      this.logger.log(`${enfants.length} enfants actifs trouvés`);

      let compteurEnvoyes = 0;

      for (const enfant of enfants) {
        const derniereAttestation = enfant.justificatifs[0];

        // Si pas d'attestation ou attestation de l'année dernière
        const doitRenouveler =
          !derniereAttestation ||
          (derniereAttestation.dateDepot &&
            new Date(derniereAttestation.dateDepot).getFullYear() < now.getFullYear());

        if (doitRenouveler) {
          // Envoyer un email de rappel au parent 1
          await this.envoyerRappelAttestation(enfant, enfant.parent1.email, enfant.parent1.name);
          compteurEnvoyes++;

          // Envoyer aussi au parent 2 s'il existe
          if (enfant.parent2) {
            await this.envoyerRappelAttestation(enfant, enfant.parent2.email, enfant.parent2.name);
            compteurEnvoyes++;
          }

          this.logger.log(`Rappel envoyé pour ${enfant.prenom} ${enfant.nom}`);
        }
      }

      this.logger.log(`${compteurEnvoyes} emails de rappel envoyés avec succès`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi des rappels: ${error.message}`, error.stack);
    }
  }

  /**
   * Envoie un email de rappel pour renouveler l'attestation RC
   */
  private async envoyerRappelAttestation(enfant: Enfant, emailParent: string, nomParent: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const year = new Date().getFullYear();

    try {
      await this.emailService.sendTemplateEmail({
        to: emailParent,
        subject: 'Renouvellement de l\'attestation de responsabilité civile',
        template: 'rappel-attestation',
        context: {
          nomParent,
          prenomEnfant: enfant.prenom,
          nomEnfant: enfant.nom,
          year,
          yearNext: year + 1,
          frontendUrl,
        },
      });

      return true;
    } catch (error) {
      this.logger.error(`Erreur envoi rappel à ${emailParent}: ${error.message}`);
      return false;
    }
  }

  /**
   * Envoie les rappels de réinscription en mai (le 15 mai)
   * Cron: tous les jours à 9h
   */
  @Cron('0 9 * * *', {
    name: 'rappel-reinscription',
    timeZone: 'Europe/Paris',
  })
  async envoyerRappelsReinscription() {
    const now = new Date();
    const mois = now.getMonth(); // 0-11 (4 = mai)
    const jour = now.getDate();

    // Envoyer uniquement le 15 mai
    if (mois !== 4 || jour !== 15) {
      return;
    }

    this.logger.log('Début de l\'envoi des rappels de réinscription (mai)');

    try {
      // Récupérer tous les enfants avec une inscription active
      const enfants = await this.prisma.enfant.findMany({
        where: {
          deletedAt: null,
          inscriptions: {
            some: {
              statut: StatutInscription.ACTIVE,
            },
          },
        },
        include: {
          parent1: { select: { id: true, name: true, prenom: true, email: true } },
          parent2: { select: { id: true, name: true, prenom: true, email: true } },
        },
      });

      this.logger.log(`${enfants.length} enfants actifs trouvés`);

      // Regrouper les enfants par parent pour éviter d'envoyer plusieurs emails
      const parentsEnfants = new Map<number, { parent: ParentInfo; enfants: Enfant[] }>();

      for (const enfant of enfants) {
        // Parent 1
        if (!parentsEnfants.has(enfant.parent1.id)) {
          parentsEnfants.set(enfant.parent1.id, { parent: enfant.parent1, enfants: [] });
        }
        parentsEnfants.get(enfant.parent1.id)?.enfants.push(enfant);

        // Parent 2 (si existe)
        if (enfant.parent2 && !parentsEnfants.has(enfant.parent2.id)) {
          parentsEnfants.set(enfant.parent2.id, { parent: enfant.parent2, enfants: [] });
        }
        if (enfant.parent2) {
          parentsEnfants.get(enfant.parent2.id)?.enfants.push(enfant);
        }
      }

      let compteurEnvoyes = 0;

      for (const [, data] of parentsEnfants) {
        await this.envoyerEmailReinscription(data.parent, data.enfants);
        compteurEnvoyes++;
      }

      this.logger.log(`${compteurEnvoyes} emails de rappel réinscription envoyés`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi des rappels réinscription: ${error.message}`, error.stack);
    }
  }

  /**
   * Envoie un email de rappel pour la réinscription
   */
  private async envoyerEmailReinscription(parent: ParentInfo, enfants: Enfant[]) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const anneeSuivante = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    const listeEnfants = enfants
      .map(e => `<li><strong>${e.prenom} ${e.nom}</strong></li>`)
      .join('');

    try {
      await this.emailService.sendTemplateEmail({
        to: parent.email,
        subject: `Réinscription ${anneeSuivante} - Action requise`,
        template: 'rappel-reinscription',
        context: {
          parentName: parent.name || parent.prenom,
          anneeSuivante,
          listeEnfants,
          frontendUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Email réinscription envoyé à ${parent.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur envoi email réinscription à ${parent.email}: ${error.message}`);
      return false;
    }
  }
}
