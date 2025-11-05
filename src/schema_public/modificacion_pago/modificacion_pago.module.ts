import { Module } from '@nestjs/common';
import { ModificacionPagoService } from './modificacion_pago.service';
import { ModificacionPagoController } from './modificacion_pago.controller';
import { Modificacion } from './entities/modificacion.entity';
import { Pago } from '../pago/entities/pago.entity';
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
import { Informe } from '../informe/entities/informe.entity';
import { InformeService } from '../informe/informe_inicial.service';
import { InformeInicial } from '../informe/entities/informe_inicial.entity';
import { Documento } from '../documento/entities/documento.entity';



@Module({

imports: [TypeOrmModule.forFeature([ModificacionPago, Solicitud, SolicitudHistorial, Pago, 
  Modificacion, Correlativo, Documento,
  Planilla, Informe, InformeInicial])],

  controllers: [ModificacionPagoController],
  providers: [ModificacionPagoService, ResponseService, CorrelativoService ,SolicitudService, PlanillaService, InformeService], 
})
export class ModificacionPagoModule {}
