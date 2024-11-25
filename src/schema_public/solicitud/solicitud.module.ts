import { Module } from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { SolicitudController } from './solicitud.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudGateway } from './solicitud.gateway';


@Module({
  imports: [TypeOrmModule.forFeature([Solicitud])],

  controllers: [SolicitudController],
  providers: [SolicitudService, ResponseService, SolicitudGateway],
  exports: [SolicitudService],  
})
export class SolicitudModule {}
