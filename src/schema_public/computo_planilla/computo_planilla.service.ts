import { Injectable } from '@nestjs/common';
import { CreateComputoDto } from './dto/create-computo.dto';
import { UpdateComputoDto } from './dto/update-computo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Computo } from './entities/computo.entity';
import { ResponseService } from 'src/response.service';
import { Repository } from 'typeorm';
import { ComputoObra } from './dto/computo-obra.dto';
import { Planilla } from './entities/planilla.entity';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { ComputoItem } from './dto/computo-Item.dto';
import { ComputoCriterio } from './entities/computo_criterio.entity';
import * as XLSX from 'xlsx';


@Injectable()
export class ComputoPlanillaService {

  private readonly DECIMAL_PLACES = 5;
  constructor(
    @InjectRepository(Computo) private computoRepositorio: Repository<Computo>,
    @InjectRepository(Planilla) private planillaRepositorio: Repository<Planilla>,
    @InjectRepository(ComputoCriterio) private criterioRepositorio: Repository<ComputoCriterio>,    
    private responseService: ResponseService

  ) { }


  async create(createComputoDto: CreateComputoDto) {
    try {
      const resultado = await this.computoRepositorio.save(createComputoDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  

  findAll() {
    return `This action returns all computoPlanilla`;
  }

  findOne(id: number) {
    return `This action returns a #${id} computoPlanilla`;
  }

  async update(id: number, updateComputoPlanillaDto: UpdateComputoDto) {
    try {
      const resultado = await this.computoRepositorio.update(id, updateComputoPlanillaDto)
      return this.responseService.success(id, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} computoPlanilla`;
  }


  async listaItemComputoXObra(data: ComputoObra) {
    try {
      ;
      let query = `
      SELECT  s.id_solicitud,  i.id_item, c.id_computo, codigo_item, i.desc_item, unidad_medida_sim, p_unitario_adjudicado, total_adjudicado, numero_veces,
      largo, ancho, alto, area, volumen, cantidad_planilla, monto_planilla, i.id_obra
      FROM public.item AS i
      LEFT OUTER JOIN public.computo  AS c ON i.id_item = c.id_item 
      LEFT OUTER JOIN public.planilla AS P ON i.id_item = c.id_item 
       INNER JOIN public.solicitud AS  s ON  i.id_obra = s.id_obra      
        WHERE i.id_obra=$1 AND s.id_solicitud = $2`;
        const params: any[] = [data.id_obra, data.id_solicitud];

      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listaComputoXItem(data: ComputoItem) {
    try {
      ;
      let query = `
      SELECT  
      i.id_item, 
      i.orden_sim,
      c.id_computo, 
      codigo_item, i.desc_item, unidad_medida_sim, p_unitario_adjudicado,
      total_adjudicado, 
      numero_veces,
      tramo, descripcion, 
      largo, ancho, alto, area, volumen, parcial, i.id_obra
      FROM public.item AS i
      LEFT OUTER JOIN public.computo  AS c ON i.id_item = c.id_item    
      WHERE i.id_item =$1`;
      const params: any[] = [data.id_item];
      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
  // EXPORTAR COMPUTOS
  async descargarComputosMetricos(data: ComputoObra) {
    try {
      ;
      let query = `
        SELECT  
        '' as nro, 
        i.id_item, 
        i.orden_sim AS orden,    
        i.desc_item  AS nombre,  
        tramo, descripcion, unidad_medida_sim as unidad,
        numero_veces as numero, 
        alto as altura ,ancho, largo,  area,  volumen, parcial
        FROM public.item AS i
        LEFT OUTER JOIN public.computo  AS c ON i.id_item = c.id_item 
        WHERE i.id_obra =$1 ORDER BY i.orden_sim ASC `;
      const params: any[] = [data.id_obra];
      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }



/////////////////////////////importar archivo excel//////////////////////////////////
async procesarYGuardarExcel(file: Express.Multer.File): Promise<{ success: boolean; message: string }> {
  try {
    // Leer y procesar el archivo Excel
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const procesados = this.procesarDatos(data);

    // Guardar los datos procesados en la base de datos en lotes
    await this.insertarDatosLotes(procesados, 500);

    return { success: true, message: 'Archivo procesado y datos almacenados correctamente.' };
  } catch (error:any) {
    throw new Error(`Error al procesar el archivo Excel: ${error.message}`);
  }
}

private procesarDatos(data: any[]): any[] {
  return data.map((row: any) => {
    Object.keys(row).forEach((key) => {
      if (typeof row[key] === 'number') {
        row[key] = this.toFixedNumber(row[key]);
      }
    });
    return row;
  });
}

private toFixedNumber(value: any): number {
  return parseFloat(Number(value || 0).toFixed(this.DECIMAL_PLACES));
}

private async insertarDatosLotes(data: any[], batchSize: number): Promise<void> {
  try {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize).map(row => ({
        id_item: row.id_item || '',
        tramo: row.tramo || '',
        descripcion: row.descripcion || '',
        numero_veces: this.ensureNumber(row.numero),
        alto: this.ensureNumber(row.altura),
        largo: this.ensureNumber(row.largo),
        ancho: this.ensureNumber(row.ancho),
        area: this.ensureNumber(row.area),
        area_total: 0,
        volumen: this.ensureNumber(row.volumen),
        volumen_total: 0,
        parcial: 0,
        id_tipo_computo: 0,
        justificacion: '',
        id_usuario_registro: 9820,
        id_estado: 1,
      }));

      await this.computoRepositorio.save(batch);
    }
  } catch (error: any) {
    throw new Error(`Error al insertar datos en la base de datos: ${error.message}`);
  }
}

/**
 * Asegura que el valor sea un número, reemplazando valores nulos o vacíos por 0.
 * @param value El valor a validar.
 */
private ensureNumber(value: any): number {
  return typeof value === 'number' && !isNaN(value) ? value : 0;
}





















  ///////////////////////////////PLANILLA//////////////////////////////
  async createPlanilla(createComputoDto: CreatePlanillaDto) {
    try {
      const resultado = await this.planillaRepositorio.save(createComputoDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }   


  ////////////////////////////////COMPUTO CRITERIO//////////////////

  async  findAllCriterio() {
    try {
      const resultado = await this.criterioRepositorio.find()
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }  
}
