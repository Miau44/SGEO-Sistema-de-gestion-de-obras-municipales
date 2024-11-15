import { Module } from '@nestjs/common';
import { SolicitudHistorialService } from './solicitud_historial.service';
import { SolicitudHistorialController } from './solicitud_historial.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudHistorial } from './entities/solicitud_historial.entity';


@Module({
  imports: [TypeOrmModule.forFeature([SolicitudHistorial])],

  controllers: [SolicitudHistorialController],
  providers: [SolicitudHistorialService, ResponseService],
})
export class SolicitudHistorialModule {}
