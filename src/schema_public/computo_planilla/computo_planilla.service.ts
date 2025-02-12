import { Injectable } from '@nestjs/common';
import { CreateComputoDto } from './dto/create-computo.dto';
import { UpdateComputoDto } from './dto/update-computo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Computo } from './entities/computo.entity';
import { ResponseService } from 'src/response.service';
import { Any, Repository } from 'typeorm';
import { ComputoObra } from './dto/computo-obra.dto';


import { ComputoItem } from './dto/computo-Item.dto';
import { ComputoCriterio } from './entities/computo_criterio.entity';
import * as XLSX from 'xlsx';
import { ErrorDetalle } from './ErrorDetalle';
import { ComputoImportarDto } from './dto/computo-importar.dto';
import { CreateComputoHistoricoDto } from './dto/create-computo-historico.dto';
import { version } from 'os';
import { ComputoModificacionDto } from './dto/computo-modificacion.dto';
import { Planilla } from '../planilla/entities/planilla.entity';
import { Item } from '../item/entities/item.entity';
import { PlanillaService } from '../planilla/planilla.service';
import { ComputoResumenDto } from './dto/computo-resumen.dto';

@Injectable()
export class ComputoPlanillaService {

  private readonly DECIMAL_PLACES = 5;
  constructor(
    @InjectRepository(Computo) private computoRepositorio: Repository<Computo>,
    @InjectRepository(ComputoCriterio) private criterioRepositorio: Repository<ComputoCriterio>,
    @InjectRepository(Planilla) private planillaRepositorio: Repository<Planilla>,

    private responseService: ResponseService,
    private planillaService: PlanillaService

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

  async remove(id: number) {
    try {
      const resultado = await this.computoRepositorio.delete(id)
      return this.responseService.success(id, "Eliminado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }    

  }


  async listaItemComputoXObra(data: ComputoModificacionDto) {



    try {
      
      let query = `
      SELECT   i.id_item, i.orden_sim,  codigo_item, i.desc_item, unidad_medida_sim, p_unitario_adjudicado, total_adjudicado,  cantidad_planilla, monto_planilla, i.id_obra
      FROM public.item AS i
      INNER JOIN public.planilla AS p ON i.id_item = p.id_item 
	  INNER JOIN public.modificacion AS m ON p.id_modificacion = m.id_modificacion
      WHERE i.id_obra= $2   AND m.id_modificacion = $1 AND i.id_estado =1 ORDER BY i.orden_sim ASC;`
      const params = [data.id_modificacion, data.id_obra];
      const resultado = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listaComputoXItem(data: ComputoItem) {
    try {
      ;
      let query =
        `  SELECT  
      m.id_modificacion,
      i.id_item, i.orden_sim, c.id_computo, 
      codigo_item, i.desc_item, unidad_medida_sim, p_unitario_adjudicado,
      total_adjudicado,  numero_veces,  tramo, descripcion, 
      CASE WHEN largo = 0 THEN '' ELSE largo::TEXT END AS largo,	      
      CASE WHEN ancho = 0 THEN '' ELSE ancho::TEXT END AS ancho,	      
      CASE WHEN alto = 0 THEN '' ELSE alto::TEXT END AS alto,	      
      CASE WHEN area = 0 THEN '' ELSE area::TEXT END AS area,	      
      CASE WHEN volumen = 0 THEN '' ELSE volumen::TEXT END AS volumen,	      
	    parcial, i.id_obra
      FROM public.item AS i
      INNER JOIN public.computo  AS c ON i.id_item = c.id_item 
	  INNER JOIN public.modificacion AS m ON c.id_modificacion  = m.id_modificacion 
	  WHERE i.id_item =$1
       AND m.id_modificacion = $2
	  AND i.id_estado=1`;

      const params = [data.id_item, data.id_modificacion];
      const resultado = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
  // EXPORTAR COMPUTOS
  async descargarComputosMetricos(data: ComputoObra) {
    try {
      ;
      let query =
        `SELECT  
      i.id_item, 
      i.orden_sim AS orden,    
      i.desc_item  AS nombre,  
      tramo, descripcion, unidad_medida_sim as unidad,
      numero_veces as numero, 
    CASE WHEN alto = 0 THEN ''  ELSE alto::TEXT END AS  altura ,
	  CASE WHEN ancho = 0 THEN '' ELSE ancho::TEXT END AS ancho,
	  CASE WHEN largo = 0 THEN '' ELSE largo::TEXT END AS largo,
	  CASE WHEN area = 0 THEN '' ELSE area::TEXT END AS area,
	  CASE WHEN volumen = 0 THEN '' ELSE volumen::TEXT END AS volumen,            
        CASE WHEN parcial = 0 THEN '' ELSE parcial::TEXT END AS parcial,
        p.justificacion	
      FROM public.item AS i
      LEFT OUTER JOIN public.computo AS c  ON i.id_item = c.id_item AND c.id_modificacion = $2
     INNER JOIN public.planilla  AS p  ON i.id_item = p.id_item AND p.id_modificacion = $2      
      WHERE i.id_obra = $1   AND i.id_estado = 1 ORDER BY i.orden_sim ASC;`;

      const params: any[] = [data.id_obra, data.id_modificacion];
      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async getTipoComputo(tipo_modificacion:number) {
    try {
      ;
      let query =
        ` SELECT   CASE 
        WHEN pp.id_subtipo = 256 THEN 260
        WHEN pp.id_subtipo = 257 THEN 259 
        ELSE 0 
        END AS id_tipo_computo
        FROM  public.parametrica AS pp WHERE id_subtipo IN($1)`;

      const params: any[] = [tipo_modificacion];
      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  





  /////////////////////////////importar archivo excel//////////////////////////////////




  async procesarYGuardarExcel(
    file: Express.Multer.File,
    body: any): Promise<{ success: boolean; message: string; errores?: ErrorDetalle[] }> {
    try {

      console.log('id_modificacion service', body.id_modificacion);

      
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const procesados = this.procesarDatos(data);

     
      const errores: ErrorDetalle[] = procesados.errores.map((error: string) => {
        const match = error.match(/fila (\d+): Campo '(\w+)' (.+)/i);
        return {
          fila: match ? parseInt(match[1], 10) : null, // `null` si no hay coincidencia
          campo: match ? match[2] : 'Desconocido',
          mensaje: match ? match[3] : error,
        };
      });

    
      if (errores.length > 0) {
        return {
          success: false,
          message: 'Archivo procesado con errores.',
          errores,
        };
      }
      // Guardar los datos procesados
      await this.insertarDatosLotes(procesados.datosProcesados, body, 500);
      return { success: true, message: 'Archivo procesado y datos almacenados correctamente.' };
    } catch (error: any) {
      throw new Error(`Error al procesar el archivo Excel: ${error.message}`);
    }
  }

  private procesarDatos(data: any[]): { errores: string[]; datosProcesados: any[] } {
    const errores: string[] = [];
    const datosProcesados = data.map((row: any, index: number) => {
      const unidad = row.unidad?.toLowerCase() || ''; // Normalizar la unidad a minúsculas
      const campos = ['altura', 'ancho', 'largo', 'area', 'volumen'];

      try {
        // Validaciones específicas por unidad
        switch (unidad) {
          case 'm': // Validaciones para unidad "m"

            if (this.ensureNumber(row.altura)) {
              this.validarCamposVacios(row, ['ancho', 'largo', 'area', 'volumen'], index, unidad, errores);
            } else if (this.ensureNumber(row.ancho)) {
              this.validarCamposVacios(row, ['altura', 'largo', 'area', 'volumen'], index, unidad, errores);
            } else if (this.ensureNumber(row.largo)) {
              this.validarCamposVacios(row, ['altura', 'ancho', 'area', 'volumen'], index, unidad, errores);
            } else {
              errores.push(`Fila ${index + 2}: Para la unidad "m", se debe especificar uno y sólo uno de los campos "altura" o "ancho" o "largo".`);
            }
            break;

          case 'm2': // Validaciones para unidad "m2"
            const m2Combinaciones = [
              ['numero'],             // Solo numero
              ['altura', 'ancho'], // Altura y ancho
              ['ancho', 'largo'],  // Ancho y largo
              ['altura', 'largo'], // Altura y largo
              ['area'],             // Solo área
            ];

            if (!this.validarCombinaciones(row, m2Combinaciones)) {
              errores.push(
                `Fila ${index + 2}: Para la unidad "m2", se debe especificar una de las siguientes Variaciones: ` +
                `altura y ancho, ancho y largo, altura y largo, o sólo área.`
              );
            }
            break;

          case 'm3': // Validaciones para unidad "m3"
            const m3Combinaciones = [
              ['numero'],             // Solo numero              
              ['altura', 'ancho', 'largo'], // Altura, ancho y largo
              ['largo', 'area'],            // Largo y área
              ['altura', 'area'],           // Altura y área
              ['ancho', 'area'],            // Ancho y área
              ['volumen']                   // Solo volumen
            ];

            if (!this.validarCombinaciones(row, m3Combinaciones)) {
              errores.push(
                `Fila ${index + 2}: Para la unidad "m3", se debe especificar una de las siguientes variaciones: ` +
                `altura, ancho y largo; largo y área; altura y área; ancho y área; o solo volumen.`
              );
            }
            break;

          default: // Validaciones para unidades adimensionales
            if (!this.ensureNumber(row.numero)) {
              errores.push(`Fila ${index + 2}: El campo "numero" es obligatorio para la unidad "${unidad}".`);
            }
            this.validarCamposVacios(row, campos, index, unidad, errores);
            break;
        }

        
        Object.keys(row).forEach((key) => {
          if (typeof row[key] === 'number') {
            row[key] = this.toFixedNumber(row[key]);
          }
        });

        return row; // Fila procesada
      } catch (error: any) {
        errores.push(`Fila ${index + 1}: ${error.message}`);
        return row; // Retornar fila aunque tenga errores
      }
    });

    return { errores, datosProcesados };
  }

  private validarCombinaciones(row: any, combinaciones: string[][]): boolean {
    // Recorremos todas las combinaciones posibles
    for (const combinacion of combinaciones) {
      // Verificamos si todos los campos de una combinación están presentes y no vacíos
      if (combinacion.every(campo => this.ensureNumber(row[campo]))) {
        return true; // Se encontró una combinación válida
      }
    }
    return false;
  }

 
  private validarCamposVacios(row: any, campos: string[], index: number, unidad: string, errores: string[]): void {
    campos.forEach((campo) => {
      if (this.ensureNumber(row[campo])) {
        errores.push(`Fila ${index + 1}: El campo "${campo}" no debe contener datos para la unidad "${unidad}".`);
      }
    });
  }

  private toFixedNumber(value: any): number {
    return parseFloat(Number(value || 0).toFixed(this.DECIMAL_PLACES));
  }


  private async insertarJustificacion(datosExcel: any[]): Promise<void> {
    try {
      const resumen = datosExcel.reduce((acc, item) => {
        acc.set(item.id_item, { id_item: item.id_item, justificacion: item.justificacion });
        return acc;
      }, new Map<number, { id_item: number; justificacion: string }>());

      const resultado: { id_item: number; justificacion: string }[] = Array.from(resumen.values());

      console.log('resultado-resumen', resultado);

      for (const item of resultado) {
        await this.planillaService.actualizarJustificacionXItem({id_item: item.id_item, justificacion: item.justificacion, id_modificacion: item.id_item});
      }
    } catch (error: any) {
      throw new Error(`Error al insertar datos en la base de datos: ${error.message}`);
    }
  }


  private async insertarDatosLotes(datosExcel: any[], dataadicional: any, batchSize: number): Promise<void> {
    try {
      //calcular version
      const max_version = await this.getMaxVersion(dataadicional.id_modificacion);
      //copiar datos actuales a computo historico      
      await this.copiarComputoaHistorico(dataadicional)    
      
      // nueva version = version +1
      const nueva_version = max_version + 1;      
      //borrar computos por id_modificacion y tipo de computo
       await this.deleteXModificacion(dataadicional.id_modificacion)

      for (let i = 0; i < datosExcel.length; i += batchSize) {
        const batch = datosExcel.slice(i, i + batchSize).map(row => {
          const noVeces = row.numero || 1;
          const aLargo = row.altura || 1;
          const bAncho = row.largo || 1;
          const cAlto = row.ancho || 1;
          const dArea = row.area || 1;
          const eVolumen = row.volumen || 1;
          const calculo_parcial = noVeces * aLargo * bAncho * cAlto * dArea * eVolumen;

          return {
            id_item: row.id_item || '',
            id_modificacion: dataadicional.id_modificacion,
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
            parcial: calculo_parcial,
            id_tipo_computo: dataadicional.id_tipo_computo,
            justificacion: '',
            version: nueva_version,
            id_usuario_registro: dataadicional.id_usuario,
            id_estado: 1,
          };
        });

        await this.computoRepositorio.save(batch);
      }     
      await this.insertarJustificacion(datosExcel);

    } catch (error: any) {
      throw new Error(`Error al insertar datos en la base de datos: ${error.message}`);
    }
  }


 

  private ensureNumber(value: any): number {
    // Convertir el valor a un número si es válido y devolverlo; de lo contrario, devolver 0.
    const parsedValue = parseFloat(value);
    return !isNaN(parsedValue) && value !== null && value !== '' ? parsedValue : 0;
  }

  async copiarComputoaHistorico(data:any) {
    try {
      let query =
        `           
            INSERT INTO public.computo_historico(id_modificacion, data_json,  version,  id_usuario_registro,
            id_estado)

            SELECT  $1 as id_modificacion, 
            jsonb_agg(jsonb_build_object('id_computo', id_computo, 'id_item' , id_item,  'tramo',  tramo, 'descripcion', descripcion, 'numero_veces', numero_veces,
            'alto', alto, 'largo',  largo, 'ancho', ancho, 'area', area, 'area_total',  area_total,  'volumen', volumen, 
            'volumen_total', volumen_total, 'parcial',  parcial, 'justificacion', justificacion, 
            'id_usuario_registro', id_usuario_registro, 'fecha_registro', fecha_registro, 'fecha_modificacion', fecha_modificacion, 
            'id_estado', id_estado)) as data_json,
            version , $2, 1
            FROM public.computo WHERE id_modificacion= $1
            GROUP BY id_modificacion, version          
          `;
      const params: any[] = [data.id_modificacion, data.id_usuario,];
      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async getMaxVersion(modificacion: number): Promise<number> {
    console.log('id_mod getmax', modificacion);    
    const query = `SELECT COALESCE(MAX(version), 0) AS max_version 
                  FROM public.computo_historico WHERE id_modificacion =$1;`;
    const param = [modificacion]
    const result = await this.computoRepositorio.query(query, param);
    console.log('result.rows[0]?.max_version', result[0].max_version || 0);
    return result[0]?.max_version || 0;
    
  }


  async deleteXModificacion(modificacion: number): Promise<number> {
    const query = `DELETE FROM public.computo WHERE id_modificacion =$1;`
    const param =[modificacion]
    const result = await this.computoRepositorio.query(query, param);
    return result;
  }



  async listaResumenXModifiacion(data:ComputoResumenDto) {
    try {
      let query =
        `           
             SELECT * FROM public.sp_resumen_x_modificacion() WHERE modificacion =$1      
          `;
      const params: any[] = [data.id_modificacion];
      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
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
