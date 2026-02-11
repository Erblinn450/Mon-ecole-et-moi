import { Module } from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { FacturationController } from './facturation.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FacturationController],
  providers: [FacturationService],
  exports: [FacturationService],
})
export class FacturationModule {}

