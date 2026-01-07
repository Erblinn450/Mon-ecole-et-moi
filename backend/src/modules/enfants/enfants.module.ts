import { Module } from '@nestjs/common';
import { EnfantsService } from './enfants.service';
import { EnfantsController } from './enfants.controller';

@Module({
  controllers: [EnfantsController],
  providers: [EnfantsService],
  exports: [EnfantsService],
})
export class EnfantsModule {}

