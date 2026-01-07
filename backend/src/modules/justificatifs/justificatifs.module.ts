import { Module } from '@nestjs/common';
import { JustificatifsService } from './justificatifs.service';
import { JustificatifsController } from './justificatifs.controller';

@Module({
  controllers: [JustificatifsController],
  providers: [JustificatifsService],
  exports: [JustificatifsService],
})
export class JustificatifsModule {}

