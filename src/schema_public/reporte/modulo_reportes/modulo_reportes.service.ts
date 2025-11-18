import { Injectable } from '@nestjs/common';
import { CreateModuloReporteDto } from './dto/create-modulo_reporte.dto';
import { UpdateModuloReporteDto } from './dto/update-modulo_reporte.dto';
import { ReporteGestionDto } from './dto/reporte-gestion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { Computo } from 'src/schema_public/computo/entities/computo.entity';
import { ReporteActaDto } from './dto/reporte-acta.dto';
import { ReporteFiscalDFO } from './dto/reporte-fiscales-dfo.dto';
import { ReporteModificaciones } from './dto/reporte-modificaciones.dto';
import { ReportePagos } from './dto/reporte-pagos.dto';

@Injectable()
export class ModuloReportesService {


private readonly DECIMAL_PLACES = 5;
  constructor(
   @InjectRepository(Computo) private reporteRepositorio: Repository<Computo>,

    private responseService: ResponseService,
  ) { }  
  create(createModuloReporteDto: CreateModuloReporteDto) {
    return 'This action adds a new moduloReporte';
  }

  findAll() {
    return `This action returns all moduloReportes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} moduloReporte`;
  }

  update(id: number, updateModuloReporteDto: UpdateModuloReporteDto) {
    return `This action updates a #${id} moduloReporte`;
  }

  remove(id: number) {
    return `This action removes a #${id} moduloReporte`;
  }


  async descargarComputosMetricos(data: ReporteGestionDto) {
    try {
    
      let queryinicio = ` 
     SELECT * FROM  public.vista_reporte_general WHERE gestion_carpeta =$1;`  ;
      const paramsinicio = [data.gestion];
      const resultado = await this.reporteRepositorio.query(queryinicio, paramsinicio);
     
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async descargarReporteActa(data: ReporteActaDto) {
    try {
    
      let queryinicio = ` 
     SELECT * FROM public.fn_reporte_general_actas($1, $2, $3);`  ;
//SELECT * FROM public.fn_reporte_general_actas('01-08-2025', '30-08-2025', 'APROBADO')     
      const paramsinicio = [data.fecha_inicio, data.fecha_fin, data.estado];
      const resultado = await this.reporteRepositorio.query(queryinicio, paramsinicio);
     
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
  
  async descargarFiscalesDFO(data: ReporteFiscalDFO) {
    try {
      let query = ` 
          SELECT * FROM public."vista_reporte_fiscales_DFO" WHERE fecha_designacion >= $1 AND fecha_designacion <= $2`;
          const parametros = [data.fecha_inicio, data.fecha_fin];
          const res = await this.reporteRepositorio.query(query, parametros)

          return this.responseService.success(res, 'Listado correctamente')
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async descargarModificaciones(data: ReporteModificaciones) {
    try {
      let query = ` 
          SELECT * FROM public."vista_db_modificaciones" WHERE gestion_carpeta = $1 `;
          const parametro = [data.gestion];
          const res = await this.reporteRepositorio.query(query, parametro)

          return this.responseService.success(res, 'Listado correctamente')
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async descargarPagos(data: ReportePagos) {
    try {
      let query = ` 
          SELECT * FROM public."vista_db_pagos" WHERE gestion_carpeta = $1 `;
          const parametro = [data.gestion];
          const res = await this.reporteRepositorio.query(query, parametro)

          return this.responseService.success(res, 'Listado correctamente')
    } catch (error) {
      return this.responseService.error(error);
    }
  }

}
