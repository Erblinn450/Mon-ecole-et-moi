import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

/**
 * Guard pour valider le token reCAPTCHA v3
 * Utilisation: @UseGuards(RecaptchaGuard) sur les routes sensibles
 */
@Injectable()
export class RecaptchaGuard implements CanActivate {
  private readonly logger = new Logger(RecaptchaGuard.name);

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const secretKey = this.configService.get('RECAPTCHA_SECRET_KEY');
    
    // Si pas de clé configurée, désactiver la validation (développement)
    if (!secretKey) {
      this.logger.warn('reCAPTCHA désactivé: RECAPTCHA_SECRET_KEY non configurée');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const recaptchaToken = request.body?.recaptchaToken || request.headers['x-recaptcha-token'];

    if (!recaptchaToken) {
      throw new BadRequestException('Token reCAPTCHA manquant');
    }

    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: recaptchaToken,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        this.logger.warn(`reCAPTCHA invalide: ${JSON.stringify(data['error-codes'])}`);
        throw new BadRequestException('Validation reCAPTCHA échouée');
      }

      // Vérifier le score (reCAPTCHA v3 renvoie un score entre 0 et 1)
      const minScore = parseFloat(this.configService.get('RECAPTCHA_MIN_SCORE', '0.5'));
      if (data.score !== undefined && data.score < minScore) {
        this.logger.warn(`Score reCAPTCHA trop bas: ${data.score} < ${minScore}`);
        throw new BadRequestException('Activité suspecte détectée');
      }

      this.logger.log(`reCAPTCHA validé avec score: ${data.score || 'N/A'}`);
      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Erreur validation reCAPTCHA: ${error.message}`);
      throw new BadRequestException('Erreur de validation reCAPTCHA');
    }
  }
}
