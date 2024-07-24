import { Module } from '@nestjs/common';
import { FlujoService } from './flujo.service';
import { FlujoController } from './flujo.controller';

@Module({
  controllers: [FlujoController],
  providers: [FlujoService],
})
export class FlujoModule {}
