import { Module } from '@nestjs/common';
import { ProtocoloService } from './protocolo.service';
import { ProtocoloController } from './protocolo.controller';
import { ModificacionPagoModule } from '../modificacion_pago/modificacion_pago.module';

@Module({
  imports: [
    ModificacionPagoModule, 
  ],
  controllers: [ProtocoloController],
  providers: [ProtocoloService],
})
export class ProtocoloModule {}
