import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MandatSepaService } from './mandat-sepa.service';
import { MandatSepaPdfService } from './mandat-sepa-pdf.service';
import { MandatSepaController } from './mandat-sepa.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MandatSepaController],
  providers: [MandatSepaService, MandatSepaPdfService],
  exports: [MandatSepaService],
})
export class MandatSepaModule {}
