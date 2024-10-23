import { Module } from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { SolicitudController } from './solicitud.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from './entities/solicitud.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Solicitud])],

  controllers: [SolicitudController],
  providers: [SolicitudService, ResponseService],
})
export class SolicitudModule {}
