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
  ) {}

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

    try {
      await this.mailerService.sendMail({
        to: emailParent,
        subject:
          '🎉 Votre pré-inscription a été validée ! - Mon École et Moi',
        template: 'preinscription-validated',
        context: {
          ...rest,
          emailParent,
          motDePasse, // Inclure le mot de passe pour l'afficher dans l'email
          year: new Date().getFullYear(),
        },
      });

      // Ne pas envoyer le mot de passe au parent 2 (il devra se créer son propre compte)
      if (emailParent2) {
        await this.mailerService.sendMail({
          to: emailParent2,
          subject:
            '🎉 Votre pré-inscription a été validée ! - Mon École et Moi',
          template: 'preinscription-validated',
          context: {
            ...rest,
            emailParent: emailParent2,
            motDePasse: null, // Pas de mot de passe pour le parent 2
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
        subject: 'Réponse à votre demande de pré-inscription - Mon École et Moi',
        template: 'preinscription-refus',
        context: {
          ...rest,
          year: new Date().getFullYear(),
        },
      });

      if (emailParent2) {
        await this.mailerService.sendMail({
          to: emailParent2,
          subject:
            'Réponse à votre demande de pré-inscription - Mon École et Moi',
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
}

