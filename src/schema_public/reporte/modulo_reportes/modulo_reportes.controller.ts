import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModuloReportesService } from './modulo_reportes.service';
import { CreateModuloReporteDto } from './dto/create-modulo_reporte.dto';
import { UpdateModuloReporteDto } from './dto/update-modulo_reporte.dto';
import { ReporteGestionDto } from './dto/reporte-gestion.dto';
import { ReporteActaDto } from './dto/reporte-acta.dto';
import { ReporteFiscalDFO } from './dto/reporte-fiscales-dfo.dto';
import { ReporteModificaciones } from './dto/reporte-modificaciones.dto';
import { ReportePagos } from './dto/reporte-pagos.dto';

@Controller('modulo-reportes')
export class ModuloReportesController {
  constructor(private readonly moduloReportesService: ModuloReportesService) {}

  @Post()
  create(@Body() createModuloReporteDto: CreateModuloReporteDto) {
    return this.moduloReportesService.create(createModuloReporteDto);
  }

  @Get()
  findAll() {
    return this.moduloReportesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduloReportesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModuloReporteDto: UpdateModuloReporteDto) {
    return this.moduloReportesService.update(+id, updateModuloReporteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduloReportesService.remove(+id);
  }



  @Post('reporte-general')
  exportarGeneral(@Body() reporteObra: ReporteGestionDto) {
    try {  
      return this.moduloReportesService.descargarComputosMetricos(reporteObra);
    } catch (error) {
    }
  }   

  @Post('reporte-general-acta')
  exportarGeneralActa(@Body() reporteObra: ReporteActaDto) {
    try {  
      return this.moduloReportesService.descargarReporteActa(reporteObra);
    } catch (error) {
    }
  } 
  
  @Post('reporte-fiscales-dfo')
  exportarFiscalesDFO(@Body() reporteObra: ReporteFiscalDFO) {
    try {  
      return this.moduloReportesService.descargarFiscalesDFO(reporteObra);
    } catch (error) {
    }
  }

  @Post('reporte-modificaciones')
  exportarModificaciones(@Body() reporteModif: ReporteModificaciones) {
    try {  
      return this.moduloReportesService.descargarModificaciones(reporteModif);
    } catch (error) {
    }
  }

  @Post('reporte-pagos')
  exportarPagos(@Body() reportePago: ReporteModificaciones) {
    try {  
      return this.moduloReportesService.descargarPagos(reportePago);
    } catch (error) {
    }
  }

}
