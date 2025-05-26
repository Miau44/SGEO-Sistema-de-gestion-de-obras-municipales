import { Module } from '@nestjs/common';
import { InformeService } from './informe_inicial.service';
import { InformeController } from './informe_inicial.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Informe } from './entities/informe.entity';
import { InformeInicial } from './entities/informe_inicial.entity';
import { Correlativo } from '../correlativo/entities/correlativo.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { Documento } from '../documento/entities/documento.entity';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { SolicitudService } from '../solicitud/solicitud.service';
import { SolicitudHistorial } from '../solicitud/entities/solicitud_historial.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Informe, InformeInicial, Correlativo, Solicitud, Documento, SolicitudHistorial])],

  controllers: [InformeController],
  providers: [InformeService, ResponseService, CorrelativoService, SolicitudService, ],
})
export class InformeInicialModule {}
