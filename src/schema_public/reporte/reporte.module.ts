import { Module } from '@nestjs/common';
import { ReportService } from './reporte.service';
import { ReportController } from './reporte.controller';
import { ResponseService } from 'src/response.service';


import { SequelizeModule } from '@nestjs/sequelize';
import { report } from 'process';
import { ReporteOrdenProcederService } from './reporte-orden-proceder.service';
import { ReporteModificacionService } from './reporte-modificacion.service';
import { ReporteActPreviasService } from './reporte-act-previas.service';
import { InformeModificacionSupervisorService } from './modificacion/informe-modificacion-supervisor.service';

@Module({

  imports: [ 
    
    SequelizeModule.forFeature([]), 
  ],

  providers: [ReportService, ResponseService, ReporteOrdenProcederService, ReporteModificacionService, ReporteActPreviasService,InformeModificacionSupervisorService],
  controllers: [ReportController],
})
export class ReporteModule {}
