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

@Module({

  imports: [ 
    
    SequelizeModule.forFeature([]), 
  ],

  providers: [ReportService, ResponseService, ReporteOrdenProcederService, ReporteModificacionService, ReporteActPreviasService,
              InformeModificacionSupervisor,MemoOrdenCambio,SolicitudGarantia,InformeModificacionFiscal,ComputoMetrico,AnexoOC,
              PlanillaReordenamiento],
  controllers: [ReportController],
})
export class ReporteModule {}
