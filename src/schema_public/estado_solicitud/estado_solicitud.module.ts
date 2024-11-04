import { Module } from '@nestjs/common';
import { EstadoSolicitudService } from './estado_solicitud.service';
import { EstadoSolicitudController } from './estado_solicitud.controller';

@Module({
  controllers: [EstadoSolicitudController],
  providers: [EstadoSolicitudService],
})
export class EstadoSolicitudModule {}
