import { Module, forwardRef } from '@nestjs/common';
import { PreinscriptionsService } from './preinscriptions.service';
import { PreinscriptionsController } from './preinscriptions.controller';
import { FacturationModule } from '../facturation/facturation.module';

@Module({
  imports: [forwardRef(() => FacturationModule)],
  controllers: [PreinscriptionsController],
  providers: [PreinscriptionsService],
  exports: [PreinscriptionsService],
})
export class PreinscriptionsModule {}

