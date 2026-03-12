import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Préfixe global pour l'API
  app.setGlobalPrefix('api');

  // Filtre d'exception global — masque les stack traces en production
  app.useGlobalFilters(new AllExceptionsFilter());

  // Headers de sécurité HTTP (Helmet)
  app.use(helmet({
    contentSecurityPolicy: false, // Géré par le frontend (Next.js)
    crossOriginEmbedderPolicy: false, // Nécessaire pour les fichiers uploadés
  }));

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS - Configuration complète pour production
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Disposition'],
  });

  // Swagger Documentation — désactivé en production
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mon École et Moi API')
      .setDescription('API pour la gestion scolaire Montessori')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentification')
      .addTag('users', 'Gestion des utilisateurs')
      .addTag('enfants', 'Gestion des enfants')
      .addTag('preinscriptions', 'Gestion des préinscriptions')
      .addTag('repas', 'Commande de repas')
      .addTag('periscolaire', 'Gestion du périscolaire')
      .addTag('facturation', 'Facturation')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Application running on: http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`API Documentation: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
