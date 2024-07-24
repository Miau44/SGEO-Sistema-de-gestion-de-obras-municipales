import { Module } from '@nestjs/common';
import { ReportService } from './reporte.service';
import { ReportController } from './reporte.controller';

@Module({
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReporteModule {}
