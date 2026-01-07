import { Module } from '@nestjs/common';
import { RepasService } from './repas.service';
import { RepasController } from './repas.controller';

@Module({
  controllers: [RepasController],
  providers: [RepasService],
  exports: [RepasService],
})
export class RepasModule {}

