import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        // Console logs (toujours actif)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              const contextStr = context ? `[${context}]` : '';
              return `[${timestamp}] ${level} ${contextStr}: ${message}`;
            }),
          ),
        }),

        // Logs d'erreurs dans un fichier (production)
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        // Tous les logs dans un fichier (production)
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
