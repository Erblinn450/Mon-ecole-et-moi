import { Module } from '@nestjs/common';
import { RappelsService } from './rappels.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [RappelsService],
  exports: [RappelsService],
})
export class RappelsModule {}
