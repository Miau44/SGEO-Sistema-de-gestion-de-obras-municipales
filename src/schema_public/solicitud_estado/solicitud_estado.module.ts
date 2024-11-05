import { Module } from '@nestjs/common';
import { SolicitudEstadoService } from './solicitud_estado.service';
import { SolicitudEstadoController } from './solicitud_estado.controller';

@Module({
  controllers: [SolicitudEstadoController],
  providers: [SolicitudEstadoService],
})
export class SolicitudEstadoModule {}
