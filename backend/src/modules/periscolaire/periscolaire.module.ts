import { Module } from '@nestjs/common';
import { PeriscolaireService } from './periscolaire.service';
import { PeriscolaireController } from './periscolaire.controller';

@Module({
  controllers: [PeriscolaireController],
  providers: [PeriscolaireService],
  exports: [PeriscolaireService],
})
export class PeriscolaireModule {}

