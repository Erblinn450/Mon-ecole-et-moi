import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './modules/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EnfantsModule } from './modules/enfants/enfants.module';
import { PreinscriptionsModule } from './modules/preinscriptions/preinscriptions.module';
// TODO: Réactiver en AVRIL (selon planning)
// import { RepasModule } from './modules/repas/repas.module';
// import { PeriscolaireModule } from './modules/periscolaire/periscolaire.module';
import { JustificatifsModule } from './modules/justificatifs/justificatifs.module';
import { SignaturesModule } from './modules/signatures/signatures.module';
import { FacturationModule } from './modules/facturation/facturation.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting (protection anti-spam)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ([
        {
          // Limite globale: 100 requêtes par minute
          ttl: parseInt(configService.get('THROTTLE_TTL', '60'), 10) * 1000,
          limit: parseInt(configService.get('THROTTLE_LIMIT', '100'), 10),
        },
      ]),
      inject: [ConfigService],
    }),

    // Planification de tâches (factures mensuelles, etc.)
    ScheduleModule.forRoot(),

    // Prisma (base de données)
    PrismaModule,

    // Email
    EmailModule,

    // Modules fonctionnels
    AuthModule,
    UsersModule,
    EnfantsModule,
    PreinscriptionsModule,
    JustificatifsModule,
    SignaturesModule,
    FacturationModule,
    DocumentsModule,
    LoggerModule,

    // TODO: Réactiver en AVRIL (selon planning)
    // RepasModule,
    // PeriscolaireModule,
  ],
  providers: [
    // Activer le rate limiting globalement
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

