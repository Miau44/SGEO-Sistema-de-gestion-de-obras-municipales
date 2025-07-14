import { Module } from '@nestjs/common';
import { ReportService } from './reporte.service';
import { ReportController } from './reporte.controller';
import { ResponseService } from 'src/response.service';


import { SequelizeModule } from '@nestjs/sequelize';
import { report } from 'process';
import { ReporteOrdenProcederService } from './reporte-orden-proceder.service';
import { ReporteModificacionService } from './reporte-modificacion.service';
import { ReporteActPreviasService } from './reporte-act-previas.service';
import { InformeModificacionSupervisor } from './modificacion/informe-modificacion-supervisor.service';
import { MemoOrdenCambio } from './modificacion/memo-orden-cambio.service';
import { SolicitudGarantia } from './modificacion/solicitud-garantia.service';
import { InformeModificacionFiscal } from './modificacion/informe-modificacion-fiscal.service';
import { ComputoMetrico } from './modificacion/computo-metrico.service';
import { AnexoOC } from './modificacion/anexo-oc.service';
import { PlanillaReordenamiento } from './modificacion/planilla-reordenamiento.service';
import { InformeObraSupervisor } from './Informe_obra/informe_supervisor.service';
import { InformeObraFiscal } from './Informe_obra/informe_fiscal.service';
import { ActaProvisional } from './actas/acta_provisional.service';
import { InformeInicialService } from './actividades_previas/informe_inicial/informe_inicial.service';
import { ComputoMetricoPago } from './pagos/computo-metrico-pagos.service';
import { PlanillaPago } from './pagos/planilla-pagos.service';
import { InformePagoSupervisor } from './pagos/informe-pago-supervisor.service';
import { InformePagoFiscal } from './pagos/informe_pago_fiscal.service';
import { ResumenCertificado } from './pagos/resumen-certificado.service';
import { ActaDefinitiva } from './actas/acta_definitiva.service';

@Module({

  imports: [ 
    
    SequelizeModule.forFeature([]), 
  ],

  providers: [ReportService, ResponseService, ReporteOrdenProcederService, ReporteModificacionService, ReporteActPreviasService,
              InformeModificacionSupervisor,MemoOrdenCambio,SolicitudGarantia,InformeModificacionFiscal,ComputoMetrico,AnexoOC,
              PlanillaReordenamiento, InformeObraSupervisor, InformeObraFiscal, ActaProvisional, InformeInicialService, ComputoMetricoPago, 
              PlanillaPago, InformePagoSupervisor, InformePagoFiscal, ResumenCertificado, ActaDefinitiva],
  controllers: [ReportController],
})
export class ReporteModule {}
