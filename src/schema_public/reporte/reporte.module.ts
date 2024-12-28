import { Module } from '@nestjs/common';
import { ReportService } from './reporte.service';
import { ReportController } from './reporte.controller';
import { ResponseService } from 'src/response.service';


import { SequelizeModule } from '@nestjs/sequelize';
import { report } from 'process';
import { ReporteOrdenProcederService } from './reporte-orden-proceder.service';
import { ReporteModificacionService } from './reporte-modificacion.service';


@Module({

  imports: [ 
    
    SequelizeModule.forFeature([]), 
  ],

  providers: [ReportService, ResponseService, ReporteOrdenProcederService, ReporteModificacionService],
  controllers: [ReportController],
})
export class ReporteModule {}
