import { Module } from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { SolicitudController } from './solicitud.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudGateway } from './solicitud.gateway';
import { SolicitudHistorial } from './entities/solicitud_historial.entity';
import { Informe } from '../informe/entities/informe.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Solicitud, SolicitudHistorial, Informe])],

  controllers: [SolicitudController],
  providers: [SolicitudService, ResponseService, SolicitudGateway],
  exports: [SolicitudService],  
})
export class SolicitudModule {}
