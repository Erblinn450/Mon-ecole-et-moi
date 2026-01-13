/**
 * EXEMPLE D'UTILISATION DU LOGGER
 * 
 * Ce fichier montre comment utiliser Winston Logger dans vos services
 */

import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ExampleService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) 
    private readonly logger: Logger,
  ) {}

  async exampleMethod() {
    // Info level
    this.logger.info('Tentative de connexion utilisateur', {
      context: 'AuthService',
      userId: 123,
    });

    // Warn level
    this.logger.warn('Token proche de l\'expiration', {
      context: 'AuthService',
      tokenId: 'abc123',
    });

    // Error level
    this.logger.error('Échec de connexion à la base de données', {
      context: 'DatabaseService',
      error: 'Connection timeout',
      timestamp: new Date().toISOString(),
    });

    // Debug level (utile en développement)
    this.logger.debug('Données reçues', {
      context: 'ApiService',
      data: { foo: 'bar' },
    });
  }
}

/**
 * Les logs sont automatiquement:
 * - Affichés dans la console (avec couleurs)
 * - Enregistrés dans backend/logs/combined.log (tous les logs)
 * - Enregistrés dans backend/logs/error.log (erreurs uniquement)
 * 
 * Format dans les fichiers: JSON avec timestamp
 * Rotation automatique: 5 fichiers max, 5MB chacun
 */
