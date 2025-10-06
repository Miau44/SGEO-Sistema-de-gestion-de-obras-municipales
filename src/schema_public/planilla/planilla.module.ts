import { Module } from '@nestjs/common';
import { PlanillaService } from './planilla.service';
import { PlanillaController } from './planilla.controller';
import { ResponseService } from 'src/response.service';
import { Planilla } from './entities/planilla.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformeService } from '../informe/informe_inicial.service';
import { InformeInicial } from '../informe/entities/informe_inicial.entity';
import { Informe } from '../informe/entities/informe.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { Documento } from '../documento/entities/documento.entity';
import { SolicitudService } from '../solicitud/solicitud.service';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { Correlativo } from '../correlativo/entities/correlativo.entity';
import { SolicitudHistorial } from '../solicitud/entities/solicitud_historial.entity';

@Module({
  imports: [ 
  TypeOrmModule.forFeature([Planilla, InformeInicial, Informe, Solicitud, Documento, Correlativo, SolicitudHistorial])],   
  controllers: [PlanillaController],
  providers: [PlanillaService, ResponseService, InformeService, SolicitudService, CorrelativoService],
})
export class PlanillaModule {}
