import { Injectable } from '@nestjs/common';
import { CreateModuloReporteDto } from './dto/create-modulo_reporte.dto';
import { UpdateModuloReporteDto } from './dto/update-modulo_reporte.dto';
import { ReporteGestionDto } from './dto/reporte-gestion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { Computo } from 'src/schema_public/computo/entities/computo.entity';


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
     SELECT * FROM  public.vista_reporte_general WHERE gestion_carpeta =2025;`  ;
      const paramsinicio = [data.gestion];
      const resultado = await this.reporteRepositorio.query(queryinicio, paramsinicio);
     
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

}
