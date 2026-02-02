import { Module } from '@nestjs/common';
import { ReinscriptionsController } from './reinscriptions.controller';
import { ReinscriptionsService } from './reinscriptions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [ReinscriptionsController],
  providers: [ReinscriptionsService],
  exports: [ReinscriptionsService],
})
export class ReinscriptionsModule {}
