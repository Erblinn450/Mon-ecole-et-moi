import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

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
  private readonly useBrevoApi: boolean;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.useBrevoApi = this.configService.get('MAIL_PROVIDER') === 'brevo-api';
    if (this.useBrevoApi) {
      this.logger.log('Email provider: Brevo HTTP API');
    }
  }

  /**
   * Envoie un email via Brevo HTTP API ou SMTP selon la config
   */
  private async sendEmail(options: { to: string; subject: string; template: string; context: Record<string, any> }): Promise<void> {
    if (this.useBrevoApi) {
      await this.sendViaBrevoApi(options);
      return;
    }
    await this.mailerService.sendMail(options);
  }

  /**
   * Compile un template Handlebars et envoie via l'API HTTP Brevo
   */
  private async sendViaBrevoApi(options: { to: string; subject: string; template: string; context: Record<string, any> }) {
    const apiKey = this.configService.get('BREVO_API_KEY');
    if (!apiKey) {
      throw new Error('BREVO_API_KEY manquante pour le provider brevo-api');
    }

    // Lire et compiler le template Handlebars
    const templatePath = path.join(__dirname, 'templates', `${options.template}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(templateSource);
    const htmlContent = compiled(options.context);

    // Parser MAIL_FROM "Nom <email>"
    const mailFrom = this.configService.get('MAIL_FROM', 'Mon École et Moi <noreply@monecole.fr>');
    const fromMatch = mailFrom.match(/^"?(.+?)"?\s*<(.+?)>$/);
    const senderName = fromMatch ? fromMatch[1].trim() : 'Mon École et Moi';
    const senderEmail = fromMatch ? fromMatch[2] : mailFrom;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Brevo API ${response.status}: ${errorBody}`);
    }

    return response.json();
  }

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
      await this.sendEmail({
        to: emailParent,
        subject:
          'Confirmation de votre demande de pré-inscription - Mon École et Moi',
        template: 'preinscription-confirmation',
        context: templateData,
      });

      this.logger.log(`Email de confirmation envoyé à ${emailParent}`);

      // Envoyer au parent 2 si présent
      if (emailParent2) {
        await this.sendEmail({
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
      await this.sendEmail({
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
        await this.sendEmail({
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
      await this.sendEmail({
        to: emailParent,
        subject: 'Mon école Montessori et Moi - Statut de votre dossier d\'inscription pour ' + data.prenomEnfant,
        template: 'preinscription-refus',
        context: {
          ...rest,
          year: new Date().getFullYear(),
        },
      });

      if (emailParent2) {
        await this.sendEmail({
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
      await this.sendEmail({
        to: emailParent,
        subject: 'Mon école Montessori et Moi - Confirmation d\'annulation de la demande d\'inscription pour ' + data.prenomEnfant,
        template: 'preinscription-annulation',
        context: {
          ...rest,
          year: new Date().getFullYear(),
        },
      });

      if (emailParent2) {
        await this.sendEmail({
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
   * Email de réinscription validée
   */
  async sendReinscriptionValidated(data: {
    emailParent: string;
    nomParent: string;
    prenomParent: string;
    nomEnfant: string;
    prenomEnfant: string;
    anneeScolaire: string;
    classeSouhaitee: string | null;
  }) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const classeLabels: Record<string, string> = {
      MATERNELLE: 'Maison des enfants (3-6 ans)',
      ELEMENTAIRE: 'Élémentaire (6-12 ans)',
      COLLEGE: 'Collège',
    };

    try {
      await this.sendEmail({
        to: data.emailParent,
        subject: `Mon école Montessori et Moi - Réinscription de ${data.prenomEnfant} acceptée !`,
        template: 'reinscription-validee',
        context: {
          ...data,
          classeSouhaitee: classeLabels[data.classeSouhaitee || ''] || data.classeSouhaitee || 'Non définie',
          frontendUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Email de réinscription validée envoyé`);
      return true;
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email de réinscription validée", {
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Email de réinscription refusée
   */
  async sendReinscriptionRefused(data: {
    emailParent: string;
    nomParent: string;
    prenomParent: string;
    nomEnfant: string;
    prenomEnfant: string;
    anneeScolaire: string;
    commentaire?: string | null;
  }) {
    try {
      await this.sendEmail({
        to: data.emailParent,
        subject: `Mon école Montessori et Moi - Statut de la réinscription de ${data.prenomEnfant}`,
        template: 'reinscription-refusee',
        context: {
          ...data,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Email de réinscription refusée envoyé`);
      return true;
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email de réinscription refusée", {
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
      await this.sendEmail({
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

      this.logger.log(`Email de vérification envoyé`);
      return true;
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email de vérification", {
        error: error.message,
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
      await this.sendEmail({
        to: email,
        subject: 'Réinitialisation de votre mot de passe - Mon École et Moi',
        template: 'password-reset',
        context: {
          userName,
          resetUrl,
          year: new Date().getFullYear(),
        },
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

  /**
   * Email de notification de facture disponible
   */
  async sendFactureNotification(data: {
    emailParent: string;
    prenomParent: string;
    numeroFacture: string;
    montant: string;
    factureId: number;
    prenomEnfant?: string;
    dateEcheance: string;
  }) {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const factureUrl = `${frontendUrl}/mes-factures/${data.factureId}`;

    try {
      await this.sendEmail({
        to: data.emailParent,
        subject: `Mon école Montessori et Moi - Facture ${data.numeroFacture} disponible`,
        template: 'facture-envoi',
        context: {
          prenomParent: data.prenomParent,
          numeroFacture: data.numeroFacture,
          montant: data.montant,
          prenomEnfant: data.prenomEnfant,
          factureUrl,
          dateEcheance: data.dateEcheance,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Email facture envoyé pour ${data.numeroFacture}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur envoi email facture ${data.numeroFacture}`, {
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Envoie un email via un template Handlebars
   */
  async sendTemplateEmail(options: { to: string; subject: string; template: string; context: Record<string, any> }) {
    return this.sendEmail(options);
  }
}
