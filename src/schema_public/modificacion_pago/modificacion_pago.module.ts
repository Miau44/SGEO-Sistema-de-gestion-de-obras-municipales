import { Module } from '@nestjs/common';
import { ModificacionPagoService } from './modificacion_pago.service';
import { ModificacionPagoController } from './modificacion_pago.controller';
import { Modificacion } from './entities/modificacion.entity';
import { Pago } from './entities/pago.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { ModificacionPago } from './entities/modificacion_pago.entity';
import { Correlativo } from '../correlativo/entities/correlativo.entity';
import { SolicitudService } from '../solicitud/solicitud.service';
import { SolicitudHistorial } from '../solicitud/entities/solicitud_historial.entity';
import { PlanillaService } from '../planilla/planilla.service';
import { Planilla } from '../planilla/entities/planilla.entity';

@Module({

imports: [TypeOrmModule.forFeature([ModificacionPago, Solicitud, SolicitudHistorial, Pago, Modificacion, Correlativo, Planilla])],

  controllers: [ModificacionPagoController],
  providers: [ModificacionPagoService, ResponseService, CorrelativoService ,SolicitudService, PlanillaService],
})
export class ModificacionPagoModule {}
