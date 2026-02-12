import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface PreinscriptionEmailData {
  numeroDossier: string;
  nomEnfant: string;
  prenomEnfant: string;
  dateNaissance: Date | string;
  classeSouhaitee: string;
  dateIntegration?: Date | string | null;
  civiliteParent?: string | null;
  nomParent: string;
  emailParent: string;
  emailParent2?: string | null;
  motDePasse?: string | null; // Pour l'email de validation avec identifiants
}

interface EmailVerificationData {
  numeroDossier: string;
  nomEnfant: string;
  prenomEnfant: string;
  civiliteParent?: string | null;
  nomParent: string;
  emailParent: string;
  verificationToken: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) { }

  async sendPreinscriptionConfirmation(data: PreinscriptionEmailData) {
    const { emailParent, emailParent2, ...rest } = data;

    // Formater la date de naissance
    const dateNaissance =
      data.dateNaissance instanceof Date
        ? data.dateNaissance.toLocaleDateString('fr-FR')
        : new Date(data.dateNaissance).toLocaleDateString('fr-FR');

    const dateIntegration = data.dateIntegration
      ? data.dateIntegration instanceof Date
        ? data.dateIntegration.toLocaleDateString('fr-FR')
        : new Date(data.dateIntegration).toLocaleDateString('fr-FR')
      : null;

    const templateData = {
      ...rest,
      dateNaissance,
      dateIntegration,
      year: new Date().getFullYear(),
    };

    try {
      // Envoyer au parent principal
      await this.mailerService.sendMail({
        to: emailParent,
        subject:
          'Confirmation de votre demande de pré-inscription - Mon École et Moi',
        template: 'preinscription-confirmation',
        context: templateData,
      });

      this.logger.log(`Email de confirmation envoyé à ${emailParent}`);

      // Envoyer au parent 2 si présent
      if (emailParent2) {
        await this.mailerService.sendMail({
          to: emailParent2,
          subject:
            'Confirmation de votre demande de pré-inscription - Mon École et Moi',
          template: 'preinscription-confirmation',
          context: templateData,
        });

        this.logger.log(`Email de confirmation envoyé à ${emailParent2}`);
      }

      return true;
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email de confirmation", {
        error: error.message,
        emailParent,
      });
      // Ne pas bloquer si l'envoi échoue
      return false;
    }
  }

  async sendPreinscriptionValidated(data: PreinscriptionEmailData) {
    const { emailParent, emailParent2, motDePasse, ...rest } = data;
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');

    // Formater la date d'intégration
    const dateIntegration = data.dateIntegration
      ? data.dateIntegration instanceof Date
        ? data.dateIntegration.toLocaleDateString('fr-FR')
        : new Date(data.dateIntegration).toLocaleDateString('fr-FR')
      : 'prochainement';

    try {
      await this.mailerService.sendMail({
        to: emailParent,
        subject: 'Mon école Montessori et Moi - Votre dossier d\'inscription pour ' + data.prenomEnfant + ' est accepté !',
        template: 'preinscription-validated',
        context: {
          ...rest,
          emailParent,
          dateIntegration,
          motDePasse, // Inclure le mot de passe pour l'afficher dans l'email
          frontendUrl,
          year: new Date().getFullYear(),
        },
      });

      // Ne pas envoyer le mot de passe au parent 2 (il devra se créer son propre compte)
      if (emailParent2) {
        await this.mailerService.sendMail({
          to: emailParent2,
          subject: 'Mon école Montessori et Moi - Votre dossier d\'inscription pour ' + data.prenomEnfant + ' est accepté !',
          template: 'preinscription-validated',
          context: {
            ...rest,
            emailParent: emailParent2,
            dateIntegration,
            motDePasse: null, // Pas de mot de passe pour le parent 2
            frontendUrl,
            year: new Date().getFullYear(),
          },
        });
      }

      this.logger.log(`Email de validation envoyé pour ${data.numeroDossier}`);
      return true;
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email de validation", {
        error: error.message,
      });
      return false;
    }
  }

  async sendPreinscriptionRefused(data: PreinscriptionEmailData) {
    const { emailParent, emailParent2, ...rest } = data;

    try {
      await this.mailerService.sendMail({
        to: emailParent,
        subject: 'Mon école Montessori et Moi - Statut de votre dossier d\'inscription pour ' + data.prenomEnfant,
        template: 'preinscription-refus',
        context: {
          ...rest,
          year: new Date().getFullYear(),
        },
      });

      if (emailParent2) {
        await this.mailerService.sendMail({
          to: emailParent2,
          subject: 'Mon école Montessori et Moi - Statut de votre dossier d\'inscription pour ' + data.prenomEnfant,
          template: 'preinscription-refus',
          context: {
            ...rest,
            year: new Date().getFullYear(),
          },
        });
      }

      this.logger.log(`Email de refus envoyé pour ${data.numeroDossier}`);
      return true;
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email de refus", {
        error: error.message,
      });
      return false;
    }
  }

  async sendPreinscriptionCancelled(data: PreinscriptionEmailData) {
    const { emailParent, emailParent2, ...rest } = data;

    try {
      await this.mailerService.sendMail({
        to: emailParent,
        subject: 'Mon école Montessori et Moi - Confirmation d\'annulation de la demande d\'inscription pour ' + data.prenomEnfant,
        template: 'preinscription-annulation',
        context: {
          ...rest,
          year: new Date().getFullYear(),
        },
      });

      if (emailParent2) {
        await this.mailerService.sendMail({
          to: emailParent2,
          subject: 'Mon école Montessori et Moi - Confirmation d\'annulation de la demande d\'inscription pour ' + data.prenomEnfant,
          template: 'preinscription-annulation',
          context: {
            ...rest,
            year: new Date().getFullYear(),
          },
        });
      }

      this.logger.log(`Email d'annulation envoyé pour ${data.numeroDossier}`);
      return true;
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email d'annulation", {
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Envoie un email de vérification avec un lien unique
   */
  async sendEmailVerification(data: EmailVerificationData) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const verificationUrl = `${frontendUrl}/verification-email?token=${data.verificationToken}`;

    try {
      await this.mailerService.sendMail({
        to: data.emailParent,
        subject: '✉️ Vérifiez votre adresse email - Mon École et Moi',
        template: 'email-verification',
        context: {
          numeroDossier: data.numeroDossier,
          nomEnfant: data.nomEnfant,
          prenomEnfant: data.prenomEnfant,
          civiliteParent: data.civiliteParent,
          nomParent: data.nomParent,
          verificationUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Email de vérification envoyé à ${data.emailParent}`);
      return true;
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email de vérification", {
        error: error.message,
        emailParent: data.emailParent,
      });
      return false;
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '🔐 Réinitialisation de votre mot de passe - Mon École et Moi',
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif;line-height: 1.6;color: #333;max-width: 600px;margin: 0 auto;padding: 20px;background-color: #f4f4f4;">
    <div style="background-color: #ffffff;border-radius: 12px;padding: 30px;box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="text-align: center;margin-bottom: 30px;padding-bottom: 20px;border-bottom: 3px solid #f59e0b;">
            <div style="font-size: 48px;margin-bottom: 10px;">🔐</div>
            <h1 style="color: #f59e0b;margin: 0;font-size: 24px;">Réinitialisation de mot de passe</h1>
        </div>

        <div style="margin-bottom: 30px;">
            <p><strong>Bonjour ${userName},</strong></p>
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>

            <div style="text-align: center;margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block;padding: 15px 30px;background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);color: white;text-decoration: none;border-radius: 12px;font-weight: bold;font-size: 16px;">
                    Réinitialiser mon mot de passe
                </a>
            </div>

            <p style="color: #6b7280;font-size: 14px;">Ce lien expire dans <strong>1 heure</strong>.</p>
            <p style="color: #6b7280;font-size: 14px;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
        </div>

        <div style="margin-top: 30px;padding-top: 20px;border-top: 1px solid #e5e7eb;text-align: center;font-size: 12px;color: #6b7280;">
            <p>© ${new Date().getFullYear()} Mon École et Moi - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
        `,
      });

      this.logger.log(`Email de réinitialisation envoyé à ${email}`);
      return true;
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email de réinitialisation", {
        error: error.message,
        email,
      });
      return false;
    }
  }
}
