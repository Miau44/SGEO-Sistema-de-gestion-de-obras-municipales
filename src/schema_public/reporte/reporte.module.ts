import { Module } from '@nestjs/common';
import { ReportService } from './reporte.service';
import { ReportController } from './reporte.controller';
import { ResponseService } from 'src/response.service';


import { SequelizeModule } from '@nestjs/sequelize';
import { report } from 'process';


@Module({

  imports: [ 
    
    SequelizeModule.forFeature([]), 
  ],

  providers: [ReportService, ResponseService],
  controllers: [ReportController],
})
export class ReporteModule {}
