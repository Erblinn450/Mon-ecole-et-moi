import { Module } from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { FacturationPdfService } from './facturation-pdf.service';
import { SepaXmlService } from './sepa-xml.service';
import { FacturationController } from './facturation.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FacturationController],
  providers: [FacturationService, FacturationPdfService, SepaXmlService],
  exports: [FacturationService, FacturationPdfService, SepaXmlService],
})
export class FacturationModule {}

