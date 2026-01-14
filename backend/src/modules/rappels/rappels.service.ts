import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
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

    this.logger.log('🔔 Début de l\'envoi des rappels d\'attestation de responsabilité civile (septembre)');

    try {
      // Récupérer tous les enfants actifs (ceux qui ont une inscription active)
      const enfants = await this.prisma.enfant.findMany({
        where: {
          deletedAt: null,
          inscriptions: {
            some: {
              statut: 'ACTIVE',
            },
          },
        },
        include: {
          parent1: true,
          parent2: true,
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

      this.logger.log(`📋 ${enfants.length} enfants actifs trouvés`);

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

          this.logger.log(`✅ Rappel envoyé pour ${enfant.prenom} ${enfant.nom}`);
        }
      }

      this.logger.log(`🎉 ${compteurEnvoyes} emails de rappel envoyés avec succès`);
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi des rappels: ${error.message}`, error.stack);
    }
  }

  /**
   * Envoie un email de rappel pour renouveler l'attestation RC
   */
  private async envoyerRappelAttestation(enfant: any, emailParent: string, nomParent: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');

    try {
      // Pour l'instant, on utilise sendMail directement
      // On pourrait créer un template dédié plus tard
      const subject = '📋 Renouvellement de l\'attestation de responsabilité civile';
      const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif;line-height: 1.6;color: #333;max-width: 600px;margin: 0 auto;padding: 20px;background-color: #f4f4f4;">
    <div style="background-color: #ffffff;border-radius: 12px;padding: 30px;box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="text-align: center;margin-bottom: 30px;padding-bottom: 20px;border-bottom: 3px solid #f59e0b;">
            <div style="font-size: 48px;margin-bottom: 10px;">📋</div>
            <h1 style="color: #f59e0b;margin: 0;font-size: 24px;">Renouvellement attestation RC</h1>
        </div>

        <div style="margin-bottom: 30px;">
            <p><strong>Bonjour ${nomParent},</strong></p>
            <p>Nous vous rappelons qu'il est nécessaire de nous fournir une nouvelle <strong>attestation d'assurance responsabilité civile</strong> pour <strong>${enfant.prenom} ${enfant.nom}</strong> pour l'année scolaire ${new Date().getFullYear()}-${new Date().getFullYear() + 1}.</p>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border-left: 4px solid #f59e0b;padding: 15px 20px;margin: 20px 0;border-radius: 0 8px 8px 0;">
                <p style="margin: 5px 0;"><strong>📅 Document requis :</strong> Attestation de responsabilité civile ${new Date().getFullYear()}</p>
                <p style="margin: 5px 0;"><strong>👶 Enfant concerné :</strong> ${enfant.prenom} ${enfant.nom}</p>
            </div>

            <p>Vous pouvez télécharger ce document directement depuis votre espace parent :</p>

            <div style="text-align: center;margin: 30px 0;">
                <a href="${frontendUrl}/fournir-documents" style="display: inline-block;padding: 15px 30px;background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);color: white;text-decoration: none;border-radius: 12px;font-weight: bold;font-size: 16px;">
                    📤 Télécharger le document
                </a>
            </div>

            <p style="color: #6b7280;font-size: 14px;">Ce document est obligatoire pour la scolarisation de votre enfant.</p>
        </div>

        <div style="margin-top: 30px;padding-top: 20px;border-top: 1px solid #e5e7eb;text-align: center;font-size: 12px;color: #6b7280;">
            <p>Pour toute question, contactez-nous à : <a href="mailto:contact@montessorietmoi.com">contact@montessorietmoi.com</a></p>
            <p>© ${new Date().getFullYear()} Mon École et Moi - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
      `;

      // Utiliser le mailer directement (pas de template pour l'instant)
      await this.emailService['mailerService'].sendMail({
        to: emailParent,
        subject,
        html,
      });

      return true;
    } catch (error) {
      this.logger.error(`Erreur envoi rappel à ${emailParent}: ${error.message}`);
      return false;
    }
  }

  /**
   * Méthode manuelle pour tester l'envoi (peut être appelée via un endpoint admin)
   */
  async testEnvoiRappels() {
    this.logger.log('🧪 Test manuel de l\'envoi des rappels');
    await this.verifierEtEnvoyerRappelsAttestationRC();
  }
}
