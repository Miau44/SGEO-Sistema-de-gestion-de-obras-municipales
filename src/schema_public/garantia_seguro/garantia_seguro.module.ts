import { Module } from '@nestjs/common';
import { GarantiaSeguroService } from './garantia_seguro.service';
import { GarantiaSeguroController } from './garantia_seguro.controller';

@Module({
  controllers: [GarantiaSeguroController],
  providers: [GarantiaSeguroService],
})
export class GarantiaSeguroModule {}
