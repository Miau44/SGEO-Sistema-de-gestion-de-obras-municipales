import { Module } from '@nestjs/common';
import { SolicitudHistorialService } from './solicitud_historial.service';
import { SolicitudHistorialController } from './solicitud_historial.controller';

@Module({
  controllers: [SolicitudHistorialController],
  providers: [SolicitudHistorialService],
})
export class SolicitudHistorialModule {}
