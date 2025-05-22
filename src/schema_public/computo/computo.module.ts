import { Module } from '@nestjs/common';
import { ComputoService } from './computo.service';
import { ComputoController } from './computo.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Computo } from './entities/computo.entity';
import { Planilla } from '../planilla/entities/planilla.entity';
import { PlanillaService } from '../planilla/planilla.service';

import { ComputoCriterio } from './entities/computo_criterio.entity';
import { Obra } from '../obra/entities/obra.entity';
import { ObraService } from '../obra/obra.service';
import { ModificacionPago } from '../modificacion_pago/entities/modificacion_pago.entity';
import { ModificacionPagoService } from '../modificacion_pago/modificacion_pago.service';
import { Correlativo } from '../correlativo/entities/correlativo.entity';
import { Pago } from '../modificacion_pago/entities/pago.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { SolicitudHistorial } from '../solicitud/entities/solicitud_historial.entity';
import { Modificacion } from '../modificacion_pago/entities/modificacion.entity';
import { SolicitudService } from '../solicitud/solicitud.service';
import { CorrelativoService } from '../correlativo/correlativo.service';


@Module({

  imports: [ 
    TypeOrmModule.forFeature([Computo,  ComputoCriterio, Planilla, Obra, ModificacionPago, Correlativo, Pago, Solicitud, SolicitudHistorial, Modificacion])],  

  controllers: [ComputoController],
  providers: [ComputoService, ResponseService, PlanillaService, ObraService, ModificacionPagoService, SolicitudService, CorrelativoService],
})
export class ComputoModule {}
