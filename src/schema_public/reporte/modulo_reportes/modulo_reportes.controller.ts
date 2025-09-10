import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModuloReportesService } from './modulo_reportes.service';
import { CreateModuloReporteDto } from './dto/create-modulo_reporte.dto';
import { UpdateModuloReporteDto } from './dto/update-modulo_reporte.dto';
import { ReporteGestionDto } from './dto/reporte-gestion.dto';

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
}
