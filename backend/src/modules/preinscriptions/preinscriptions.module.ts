import { Module } from '@nestjs/common';
import { PreinscriptionsService } from './preinscriptions.service';
import { PreinscriptionsController } from './preinscriptions.controller';

@Module({
  controllers: [PreinscriptionsController],
  providers: [PreinscriptionsService],
  exports: [PreinscriptionsService],
})
export class PreinscriptionsModule {}

