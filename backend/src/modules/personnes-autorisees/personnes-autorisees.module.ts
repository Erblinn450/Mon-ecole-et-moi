import { Module } from '@nestjs/common';
import { PersonnesAutoriseesController } from './personnes-autorisees.controller';
import { PersonnesAutoriseesService } from './personnes-autorisees.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PersonnesAutoriseesController],
  providers: [PersonnesAutoriseesService],
  exports: [PersonnesAutoriseesService],
})
export class PersonnesAutoriseesModule {}
