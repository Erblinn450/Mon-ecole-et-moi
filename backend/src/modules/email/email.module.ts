import { Module, Global, Logger } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

/**
 * Module Email avec support multi-providers
 * 
 * Providers supportés en production:
 * - SendGrid: MAIL_PROVIDER=sendgrid
 * - Mailgun: MAIL_PROVIDER=mailgun  
 * - SMTP générique: MAIL_PROVIDER=smtp
 * - MailHog (dev): MAIL_PROVIDER=mailhog ou non défini
 */
@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('EmailModule');
        const provider = configService.get('MAIL_PROVIDER', 'mailhog');
        
        let transport: any;
        
        switch (provider) {
          case 'sendgrid':
            // SendGrid SMTP
            logger.log('📧 Configuration SMTP: SendGrid');
            transport = {
              host: 'smtp.sendgrid.net',
              port: 587,
              secure: false,
              auth: {
                user: 'apikey', // SendGrid utilise 'apikey' comme user
                pass: configService.get('SENDGRID_API_KEY'),
              },
            };
            break;
            
          case 'mailgun':
            // Mailgun SMTP
            logger.log('📧 Configuration SMTP: Mailgun');
            transport = {
              host: configService.get('MAILGUN_HOST', 'smtp.mailgun.org'),
              port: 587,
              secure: false,
              auth: {
                user: configService.get('MAILGUN_USER'),
                pass: configService.get('MAILGUN_PASSWORD'),
              },
            };
            break;
            
          case 'smtp':
            // SMTP générique (OVH, Gmail, etc.)
            logger.log('📧 Configuration SMTP: Générique');
            const port = parseInt(configService.get('MAIL_PORT', '587'), 10);
            transport = {
              host: configService.get('MAIL_HOST'),
              port,
              secure: port === 465, // SSL sur port 465
              auth: {
                user: configService.get('MAIL_USER'),
                pass: configService.get('MAIL_PASSWORD'),
              },
              // Options TLS pour certains providers
              tls: {
                rejectUnauthorized: configService.get('MAIL_TLS_REJECT_UNAUTHORIZED', 'true') === 'true',
              },
            };
            break;
            
          case 'mailhog':
          default:
            // MailHog pour le développement (pas d'auth, pas de TLS)
            logger.log('📧 Configuration SMTP: MailHog (développement)');
            transport = {
              host: configService.get('MAIL_HOST', 'localhost'),
              port: parseInt(configService.get('MAIL_PORT', '1025'), 10),
              secure: false,
              ignoreTLS: true,
            };
            break;
        }
        
        return {
          transport,
          defaults: {
            from: configService.get(
              'MAIL_FROM',
              '"Mon École et Moi" <contact@montessorietmoi.com>',
            ),
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

