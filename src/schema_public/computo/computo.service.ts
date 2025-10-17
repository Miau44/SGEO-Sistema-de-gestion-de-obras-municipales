import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComputoDto } from './dto/create-computo.dto';
import { UpdateComputoDto } from './dto/update-computo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Computo } from './entities/computo.entity';
import { ResponseService } from 'src/response.service';
import { Any, DeepPartial, Repository } from 'typeorm';
import { ComputoObra } from './dto/computo-obra.dto';


import { ComputoItemDto } from './dto/computo-Item.dto';

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
import { ObraService } from '../obra/obra.service';
import { ModificacionPagoService } from '../modificacion_pago/modificacion_pago.service';
import { DecimalUtil } from 'src/common/utils/numero-decimales.utils';
import { log } from 'console';
import { ModificacionPago } from '../modificacion_pago/entities/modificacion_pago.entity';
import { CreateComputoObservacionDto } from './dto/create-computo-observacion.dto';
import { ComputoObservacion } from './entities/computo_observacion.entity';
import { ListaFiscalDto } from './dto/lista-fiscal.dto';
import { ItemService } from '../item/item.service';
import { ExternoService } from 'src/schema_private/externo/externo.service';
import { Log } from '../log/entities/log.entity';
import { LogService } from '../log/log.service';

@Injectable()
export class ComputoService {
  private var_decimal: 2 | 5 = 5; // valor por defecto

  private readonly DECIMAL_PLACES = 5;
  constructor(
    @InjectRepository(Computo) private computoRepositorio: Repository<Computo>,
    @InjectRepository(ComputoObservacion) readonly computoObsRepositorio: Repository<ComputoObservacion>,
    @InjectRepository(Planilla) private planillaRepositorio: Repository<Planilla>,
    @InjectRepository(Item) private itemRepositorio: Repository<Item>,
    @InjectRepository(Log) private logPagoRepositorio: Repository<Log>,

    private responseService: ResponseService,
    private planillaService: PlanillaService,
    private obraservice: ObraService,
    private modificacionService: ModificacionPagoService,
    private itemService: ItemService,
    private externoService: ExternoService,
    private logService: LogService,

  ) { }


  async create(createComputoDto: CreateComputoDto) {
    try {
      const info_obra = await this.modificacionService.findOne(createComputoDto.id_modificacion_pago);
      const id_obra = info_obra.data.id_obra;
      if (!info_obra || info_obra.data.length === 0) {
        throw new NotFoundException(`Obra with ID ${createComputoDto.id_modificacion_pago} not found`);
      }
      const obra = await this.obraservice.findOne(id_obra);
      const modalidad = obra.data[0].modalidad;
      this.var_decimal = modalidad === 'CONTRATACION DIRECTA' ? 2 : 5;

      createComputoDto.alto = DecimalUtil.roundToDecimals(this.ensureNumber(createComputoDto.alto), this.var_decimal);
      createComputoDto.largo = DecimalUtil.roundToDecimals(this.ensureNumber(createComputoDto.largo), this.var_decimal);
      createComputoDto.ancho = DecimalUtil.roundToDecimals(this.ensureNumber(createComputoDto.ancho), this.var_decimal);
      createComputoDto.area = DecimalUtil.roundToDecimals(this.ensureNumber(createComputoDto.area), this.var_decimal);
      createComputoDto.area_total = DecimalUtil.roundToDecimals(this.ensureNumber(createComputoDto.area_total), this.var_decimal);
      createComputoDto.volumen = DecimalUtil.roundToDecimals(this.ensureNumber(createComputoDto.volumen), this.var_decimal);
      createComputoDto.volumen_total = DecimalUtil.roundToDecimals(this.ensureNumber(createComputoDto.volumen_total), this.var_decimal);
      createComputoDto.parcial = DecimalUtil.roundToDecimals(this.ensureNumber(createComputoDto.parcial), this.var_decimal);
      const resultado = await this.computoRepositorio.save(createComputoDto);

      // LOG DE ÉXITO
      await this.logService.create({
        id_usuario: createComputoDto.id_usuario_registro,
        mensaje: 'Cómputo registrado correctamente',
        parametro: `id_modificacion_pago: ${createComputoDto.id_modificacion_pago}`,
        funcionalidad: 'creacion-computo',
        respuesta: JSON.stringify(resultado),
      });

      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {

      let mensajeError = '';
      let stackError = null;

      if (error instanceof Error) {
        mensajeError = error.message;
        stackError = error.stack;
      } else {
        mensajeError = String(error);
      }
      // LOG DE ERROR
      await this.logService.create({
        id_usuario: createComputoDto?.id_usuario_registro || 0,
        mensaje: 'Error al registrar cómputo',
        parametro: `id_modificacion_pago: ${createComputoDto?.id_modificacion_pago || 'no definido'}`,
        funcionalidad: 'create-computo',
        respuesta: JSON.stringify({
          error: mensajeError,
          stack: stackError,
        }),
      });
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
      const info_obra = await this.modificacionService.findOne(updateComputoPlanillaDto.id_modificacion_pago ?? 0);
      const id_obra = info_obra.data.id_obra;
      if (!info_obra || info_obra.data.length === 0) {
        throw new NotFoundException(`Obra with ID ${updateComputoPlanillaDto.id_modificacion_pago} not found`);
      }
      const obra = await this.obraservice.findOne(id_obra);
      const modalidad = obra.data[0].modalidad;
      this.var_decimal = modalidad === 'CONTRATACION DIRECTA' ? 2 : 5;
      updateComputoPlanillaDto.alto = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.alto), this.var_decimal);
      updateComputoPlanillaDto.largo = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.largo), this.var_decimal);
      updateComputoPlanillaDto.ancho = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.ancho), this.var_decimal);
      updateComputoPlanillaDto.area = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.area), this.var_decimal);
      // updateComputoPlanillaDto.area_total = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.area_total), this.var_decimal);
      updateComputoPlanillaDto.volumen = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.volumen), this.var_decimal);
      //  updateComputoPlanillaDto.volumen_total = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.volumen_total), this.var_decimal);
      updateComputoPlanillaDto.parcial = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.parcial), this.var_decimal);

      //***************************Calcular area_total o volumen_total según la unidad*****************************

      const aalto = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.alto), this.var_decimal) || 1;
      const alargo = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.largo), this.var_decimal) || 1;
      const aancho = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.ancho), this.var_decimal) || 1;
      const aarea = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.area), this.var_decimal) || 1;
      // updateComputoPlanillaDto.area_total = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.area_total), this.var_decimal);
      const avolumen = DecimalUtil.roundToDecimals(this.ensureNumber(updateComputoPlanillaDto.volumen), this.var_decimal) || 1;
      let v_area_total = 0;
      let v_volumen_total = 0
      const items = await this.itemService.findOne(updateComputoPlanillaDto.id_item ? updateComputoPlanillaDto.id_item : 0);
      console.log('items', items);
      if (!items) {
        throw new NotFoundException(`Item with ID ${updateComputoPlanillaDto.id_item} not found`);
      }
      const unidad = (items.unidad_medida_sim || '').toLowerCase();


      if (unidad === 'm2') {

        v_area_total = DecimalUtil.roundToDecimals(this.ensureNumber(aalto * aancho * aalto * aarea), this.var_decimal
        );

      } else if (unidad === 'm3') {

        v_volumen_total = DecimalUtil.roundToDecimals(this.ensureNumber(alargo * aancho * aalto * avolumen), this.var_decimal);


        if (aarea > 0) {
          v_area_total = DecimalUtil.roundToDecimals(this.ensureNumber(aarea), this.var_decimal);
        }
      }







      updateComputoPlanillaDto.area_total = v_area_total;
      updateComputoPlanillaDto.volumen_total = v_volumen_total;
      //***************************Calcular area_total o volumen_total según la unidad****************************/

      const resultado = await this.computoRepositorio.update(id, updateComputoPlanillaDto);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
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
         SELECT   
        p.id_planilla,  
        mp.id_modificacion_pago, 
        i.id_item, 
        i.orden_sim,  
        codigo_item, 
        i.desc_item, 
        unidad_medida_sim, 
        public.formato_numerico(i.cantidad_sim,2) AS cantidad_sim,      
        public.formato_numerico(cantidad_planilla,5) AS cantidad_planilla, 
        monto_planilla,      
        public.formato_numerico(p_unitario_adjudicado,5) AS p_unitario_adjudicado,	
        public.formato_numerico(total_adjudicado,5) AS total_adjudicado,       
        public.formato_numerico(i.cantidad_autorizada,2) AS cantidad_autorizada, 
        public.formato_numerico(cantidad_reordenamiento,2) AS reordenamiento,
        public.formato_numerico(total_reordenamiento,5) AS total_reordenamiento,       
        i.id_obra, 
        mp.id_solicitud, 
        sh.id_solicitud_historial,
        po.estado_observacion_fis -- Campo del último registro por planilla
      FROM public.item AS i
      LEFT JOIN public.planilla AS p ON i.id_item = p.id_item 
      INNER JOIN public.modificacion_pago AS mp ON p.id_modificacion_pago = mp.id_modificacion_pago
      INNER JOIN public.modificacion AS m ON mp.id_modificacion_pago = m.id_modificacion_pago 
      LEFT JOIN (
    SELECT DISTINCT ON (id_solicitud)
        id_solicitud_historial, id_solicitud, id_obra
    FROM public.solicitud_historial
    ORDER BY id_solicitud, id_solicitud_historial DESC
) AS sh ON mp.id_solicitud = sh.id_solicitud
      LEFT JOIN (
        SELECT DISTINCT ON (id_planilla) id_planilla, estado_observacion_fis
        FROM public.planilla_observacion
        WHERE id_estado = 1
        ORDER BY id_planilla, fecha_registro DESC
      ) AS po ON po.id_planilla = p.id_planilla     
      WHERE i.id_obra= $2   AND mp.id_modificacion_pago = $1 AND i.id_estado =1 ORDER BY i.orden_sim ASC;`

      const params = [data.id_modificacion_pago, data.id_obra];
      const resultado = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async listaItemComputoXObraFiscal(data: ListaFiscalDto) {
    try {

      //   let query = ` 
      //  SELECT * FROM  public.vista_modificacion_lista_fiscal WHERE id_modificacion_pago =$1; id_solicitud_historial
      //  `
      //   const params = [data.id_modificacion_pago];
      //   const query = `SELECT * FROM public.sp_listar_planilla_por_historial($1, $2)`;
      const query = `SELECT * FROM public.sp_modificacion_fiscal_item($1, $2)`;

      const params = [
        data.id_modificacion_pago,
        data.id_usuario,
      ];
      const resultado = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async montoComputoXItem(data: ComputoItemDto) {
    try {
      const datos = {
        id_item: data.id_item,
        id_modificacion_pago: data.id_modificacion_pago
      }
      await this.planillaService.actualizarPlanillaXIditem(datos);

      let query = ` SELECT cantidad_reordenamiento  AS monto_certificado_pago FROM planilla 
      WHERE id_item = $1 AND
      id_modificacion_pago = $2`;

      const params = [data.id_item, data.id_modificacion_pago];
      const resultado = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listaComputoXItem(data: ComputoItemDto) {
    try {
      ;
      /*   let query =
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
       AND i.id_estado=1`;*/
      let query = ` SELECT   c.id_computo,
    c.id_modificacion_pago,
    i.id_item, i.orden_sim, c.id_computo, 
    codigo_item, i.desc_item, unidad_medida_sim, p_unitario_adjudicado,
    total_adjudicado,  numero_veces,  tramo, descripcion, 

    CASE WHEN largo = 0 THEN '' ELSE largo::TEXT END AS largo,	      
    CASE WHEN ancho = 0 THEN '' ELSE ancho::TEXT END AS ancho,	      
    CASE WHEN alto = 0 THEN '' ELSE alto::TEXT END AS alto,	      
    CASE WHEN area = 0 THEN '' ELSE area::TEXT END AS area,	      
    CASE WHEN volumen = 0 THEN '' ELSE volumen::TEXT END AS volumen,	parcial,
    
	 /*public.formato_numerico_computo(largo,5) as largo,
	 public.formato_numerico_computo(ancho,5) AS ancho,
	 public.formato_numerico_computo(alto,5) AS alto,
	 public.formato_numerico_computo(area,5) AS area,
	 public.formato_numerico_computo(volumen,5) AS volumen,
	 public.formato_numerico_computo(parcial,5) AS parcial,	*/

    co.observacion_fiscal, i.id_obra, sh.id_solicitud_historial FROM public.item AS i
    INNER JOIN public.computo  AS c ON i.id_item = c.id_item 
    LEFT OUTER JOIN public.computo_observacion  AS co ON c.id_computo = co.id_computo 
    LEFT JOIN (
    SELECT DISTINCT ON (id_solicitud) id_solicitud_historial, mp.id_solicitud, mp.id_modificacion_pago
    FROM public.solicitud_historial as sh  
	INNER JOIN modificacion_pago AS mp ON sh.id_solicitud = mp.id_solicitud 
    ORDER BY id_solicitud, id_solicitud_historial DESC
) AS sh ON c.id_modificacion_pago = sh.id_modificacion_pago
    WHERE i.id_item =$1
    AND c.id_modificacion_pago = $2
    AND i.id_estado=1 ORDER BY c.id_computo`;

      const params = [data.id_item, data.id_modificacion_pago];
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

      /* `SELECT  
       p.id_modificacion_pago as modificacion,
     i.id_item, 
     i.orden_sim AS orden,    
     i.desc_item  AS nombre,  
     tramo, descripcion, unidad_medida_sim as unidad,
     numero_veces as numero, 
       CASE WHEN largo = 0 THEN '' ELSE largo::TEXT END AS largo,
   CASE WHEN ancho = 0 THEN '' ELSE ancho::TEXT END AS ancho,
     CASE WHEN alto = 0 THEN ''  ELSE alto::TEXT END AS  alto ,
   CASE WHEN area = 0 THEN '' ELSE area::TEXT END AS area,
   CASE WHEN volumen = 0 THEN '' ELSE volumen::TEXT END AS volumen,            
       CASE WHEN parcial = 0 THEN '' ELSE parcial::TEXT END AS parcial,
       po.justificacion_supervisor	
     FROM public.item AS i
     LEFT OUTER JOIN public.computo AS c  ON i.id_item = c.id_item AND c.id_modificacion_pago = $2
    INNER JOIN public.planilla  AS p  ON i.id_item = p.id_item AND p.id_modificacion_pago = $2 
LEFT OUTER JOIN public.planilla_justificacion AS po  ON p.id_planilla = po.id_planilla           
     WHERE i.id_obra = $1   AND i.id_estado = 1 ORDER BY i.orden_sim ASC;`;*/
      let queryinicio = ` 
     SELECT id_tipo_mod_pago FROM public.modificacion_pago WHERE id_modificacion_pago = $1;`  ;
      const paramsinicio = [data.id_modificacion_pago];
      const tipo_modificacion = await this.computoRepositorio.query(queryinicio, paramsinicio);
      console.log('tipo_modificacion', tipo_modificacion);
      if (tipo_modificacion.length === 0) {
        throw new NotFoundException(`Modificacion Pago with ID ${data.id_modificacion_pago} not found`);
      }
      let query = '';
      const v_id_tipo_mod_pago = tipo_modificacion[0]?.id_tipo_mod_pago;
      if (v_id_tipo_mod_pago < 4) {
        query = `SELECT * FROM  sp_computo_modificacion_pago($1, $2);`;
      } else {
        query = `SELECT modificacion , id_item , orden , nombre ,
              tramo , descripcion , 
              unidad , numero numeric, largo , ancho ,
              alto , area , volumen , parcial FROM  sp_computo_modificacion_pago($1, $2) WHERE total_autorizado <>0 OR total_autorizado IS NULL;`;
      }
      const params: any[] = [data.id_obra, data.id_modificacion_pago];
      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async getTipoComputo(tipo_modificacion: number) {
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
    body: any): Promise<{ success: boolean; message: string; errores?: ErrorDetalle[], datos?: any }> {
    try {
      //      console.log('id_modificacion service', body.id_modificacion);
      // Leer y procesar el archivo Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const procesados = this.procesarDatos(data);

      // Construir los errores si existen
      const errores: ErrorDetalle[] = procesados.errores.map((error: string) => {
        const match = error.match(/fila (\d+): Campo '(\w+)' (.+)/i);
        return {
          fila: match ? parseInt(match[1], 10) : null, // `null` si no hay coincidencia
          campo: match ? match[2] : 'Desconocido',
          mensaje: match ? match[3] : error,
        };
      });

      // Retornar errores si existen
      if (errores.length > 0) {
        return {
          success: false,
          message: 'Archivo procesado con errores.',
          errores,
        };
      }

      // Guardar los datos procesados
      const respuesta = await this.insertarDatosLotes(procesados.datosProcesados, body, 500);
      console.log(respuesta);

      return { success: true, message: 'Archivo procesado y datos almacenados correctamente.', datos: body };
    } catch (error: any) {
      throw new Error(`Error al procesar el archivo Excel: ${error.message}`);
    }
  }

  private procesarDatos(data: any[]): { errores: string[]; datosProcesados: any[] } {
    const errores: string[] = [];
    const datosProcesados = data.map((row: any, index: number) => {
      const unidad = row.unidad?.toLowerCase() || ''; // Normalizar la unidad a minúsculas
      //      const campos = ['alto', 'ancho', 'largo', 'area', 'volumen'];
      const campos = ['alto', 'ancho', 'largo', 'area', 'volumen'];

      try {
        // Validaciones específicas por unidad
        switch (unidad) {
          case 'm': // Validaciones para unidad "m"
            if (this.ensureNumber(row.alto)) {
              this.validarCamposVacios(row, ['ancho', 'largo', 'area', 'volumen'], index, unidad, errores);
            } else if (this.ensureNumber(row.ancho)) {
              this.validarCamposVacios(row, ['alto', 'largo', 'area', 'volumen'], index, unidad, errores);
            } else if (this.ensureNumber(row.largo)) {
              this.validarCamposVacios(row, ['alto', 'ancho', 'area', 'volumen'], index, unidad, errores);
            } else {
              errores.push(`Fila ${index + 2}: Para la unidad "m", se debe especificar uno y sólo uno de los campos "alto" o "ancho" o "largo".`);
            }
            break;

          case 'm2': // Validaciones para unidad "m2"
            const m2Combinaciones = [
              ['numero'],             // Solo numero
              ['alto', 'ancho'], // alto y ancho
              ['ancho', 'largo'],  // Ancho y largo
              ['alto', 'largo'], // alto y largo
              ['area'],             // Solo área
            ];

            if (!this.validarCombinaciones(row, m2Combinaciones)) {
              errores.push(
                `Fila ${index + 2}: Para la unidad "m2", se debe especificar una de las siguientes Variaciones: ` +
                `alto y ancho, ancho y largo, alto y largo, o sólo área.`
              );
            }
            break;

          case 'm3': // Validaciones para unidad "m3"
            const m3Combinaciones = [
              ['numero'],             // Solo numero              
              ['alto', 'ancho', 'largo'], // alto, ancho y largo
              ['largo', 'area'],            // Largo y área
              ['alto', 'area'],           // alto y área
              ['ancho', 'area'],            // Ancho y área
              ['volumen']                   // Solo volumen
            ];

            if (!this.validarCombinaciones(row, m3Combinaciones)) {
              errores.push(
                `Fila ${index + 2}: Para la unidad "m3", se debe especificar una de las siguientes variaciones: ` +
                `alto, ancho y largo; largo y área; alto y área; ancho y área; o solo volumen.`
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

        // Normalizar valores numéricos para los datos procesados
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
    return false; // Ninguna combinación válida encontrada
  }

  /**
   * Valida que los campos indicados estén vacíos y agrega errores al array.
   */
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


  private async insertarJustificacion(datosExcel: any[], id_usuario: number, id_historial: number, id_modificacion: number): Promise<void> {
    try {
      const resumen = datosExcel.reduce((acc, item) => {

        if (item.justificacion_supervisor && item.justificacion_supervisor.trim() !== '') {
          acc.set(item.id_item, {
            id_item: item.id_item,
            id_modificacion_pago: item.modificacion,
            justificacion_supervisor: item.justificacion_supervisor
          });
        }
        return acc;
      }, new Map<number, { id_item: number; id_modificacion_pago: number, justificacion_supervisor: string }>());
      const resultado: { id_item: number; id_modificacion_pago: number, justificacion_supervisor: string }[] = Array.from(resumen.values());
      //console.log('resultado-resumen', resultado);
      for (const itemres of resultado) {
        await this.planillaService.actualizarJustificacionXItem({
          id_modificacion_pago: id_modificacion,
          id_item: itemres.id_item,
          id_solicitud_historial: id_historial,
          justificacion_supervisor: itemres.justificacion_supervisor,
          id_usuario_registro: id_usuario
        });
      }
    } catch (error: any) {
      throw new Error(`Error al insertar datos en la base de datos: ${error.message}`);
    }
  }


  private async insertarDatosLotes(datosExcel: any[], dataadicional: any, batchSize: number): Promise<void> {
    try {

      const info_obra = await this.modificacionService.findOne(dataadicional.id_modificacion);
      const id_obra = info_obra.data.id_obra

      if (!info_obra || info_obra.data.length === 0) {
        throw new NotFoundException(`Obra with ID ${dataadicional.id_modificacion} not found`);
      }
      const obra = await this.obraservice.findOne(id_obra);
      const modalidad = obra.data[0].modalidad;


      console.log('modalidad', modalidad);
      if (modalidad === 'CONTRATACION DIRECTA') {
        this.var_decimal = 2;
      } else {
        this.var_decimal = 5;
      }
      if (!obra) {
        throw new NotFoundException(`Obra with ID ${id_obra} not found`);
        return
      }

      //calcular version
      const max_version = await this.getMaxVersion(dataadicional.id_modificacion);
      //copiar datos actuales a computo historico      
      await this.copiarComputoaHistorico(dataadicional)

      // nueva version = version +1
      const nueva_version = max_version + 1;
      //borrar computos por id_modificacion y tipo de computo
      await this.deleteXModificacion(dataadicional.id_modificacion)

      await this.logService.create({
        id_usuario: dataadicional.id_usuario,
        mensaje: `Insertando cómputos métricos con versión ${nueva_version}`,
        funcionalidad: 'insertarDatosLotes',
        parametro: `Total registros en Excel: ${datosExcel.length}`,
        respuesta: `Nueva versión: ${nueva_version}`
      });

      //await this.planillaService.deletePlanillaObservacionExcel(dataadicional.id_modificacion);
      const tipo_modificacion = await this.modificacionService.findOne(dataadicional.id_modificacion ?? 0);
      const v_id_tipo_mod_pago = info_obra.data.id_tipo_mod_pago;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////          

      for (let i = 0; i < datosExcel.length; i += batchSize) {
        const batch = datosExcel.slice(i, i + batchSize).map(async row => {
          /*-----------------------------cantidad_autorizada--------------------------*/
          const respuesta_item = await this.itemService.findItem(row.id_item ?? 0);
          const v_cantidad_autorizada = Number(respuesta_item.data?.cantidad_autorizada ?? 0);
          /*-----------------------------cantidad_autorizada--------------------------*/

          const noVeces = DecimalUtil.roundToDecimals(this.ensureNumber(row.numero), this.var_decimal) || 1;
          const aLargo = DecimalUtil.roundToDecimals(this.ensureNumber(row.largo), this.var_decimal) || 1;
          const bAncho = DecimalUtil.roundToDecimals(this.ensureNumber(row.ancho), this.var_decimal) || 1;
          const cAlto = DecimalUtil.roundToDecimals(this.ensureNumber(row.alto), this.var_decimal) || 1;
          const dArea = DecimalUtil.roundToDecimals(this.ensureNumber(row.area), this.var_decimal) || 1;
          const eVolumen = DecimalUtil.roundToDecimals(this.ensureNumber(row.volumen), this.var_decimal) || 1;


          const calculo_parcial = noVeces * aLargo * bAncho * cAlto * dArea * eVolumen;
          const calculoparcial = DecimalUtil.roundToDecimals(this.ensureNumber(calculo_parcial), this.var_decimal);

          //***************************Calcular area_total o volumen_total según la unidad*****************************
          let v_area_total = 0;
          let v_volumen_total = 0

          const unidad = (row.unidad || '').toLowerCase();
          if (unidad === 'm2') {
            v_area_total = DecimalUtil.roundToDecimals(
              this.ensureNumber(aLargo * bAncho * cAlto * dArea),
              this.var_decimal
            );
          } else if (unidad === 'm3') {
            v_volumen_total = DecimalUtil.roundToDecimals(
              this.ensureNumber(aLargo * bAncho * cAlto * eVolumen),
              this.var_decimal
            );

            // solo se calcula área si se proporciona un valor válido en aarea
            if (dArea > 0) {
              v_area_total = DecimalUtil.roundToDecimals(this.ensureNumber(dArea), this.var_decimal);
            }

          }
          //***************************Calcular area_total o volumen_total según la unidad****************************/
          
          if (v_id_tipo_mod_pago < 4) {
            return {
              id_item: row.id_item || '',
              id_modificacion_pago: dataadicional.id_modificacion,
              tramo: row.tramo || '',
              descripcion: row.descripcion || '',
              numero_veces: DecimalUtil.roundToDecimals(this.ensureNumber(row.numero), this.var_decimal),
              alto: DecimalUtil.roundToDecimals(this.ensureNumber(row.alto), this.var_decimal),
              largo: DecimalUtil.roundToDecimals(this.ensureNumber(row.largo), this.var_decimal),
              ancho: DecimalUtil.roundToDecimals(this.ensureNumber(row.ancho), this.var_decimal),
              area: DecimalUtil.roundToDecimals(this.ensureNumber(row.area), this.var_decimal),
              area_total: v_area_total,
              volumen_total: v_volumen_total,
              volumen: DecimalUtil.roundToDecimals(this.ensureNumber(row.volumen), this.var_decimal),
              parcial: calculoparcial,
              // id_tipo_computo: dataadicional.id_tipo_computo,
              version: nueva_version,
              // observacion_fiscal: '',
              id_usuario_registro: dataadicional.id_usuario,
              id_estado: 1,
            } as DeepPartial<Computo>;

          } else {

          if ( v_cantidad_autorizada > 0) {
            return {
              id_item: row.id_item || '',
              id_modificacion_pago: dataadicional.id_modificacion,
              tramo: row.tramo || '',
              descripcion: row.descripcion || '',
              numero_veces: DecimalUtil.roundToDecimals(this.ensureNumber(row.numero), this.var_decimal),
              alto: DecimalUtil.roundToDecimals(this.ensureNumber(row.alto), this.var_decimal),
              largo: DecimalUtil.roundToDecimals(this.ensureNumber(row.largo), this.var_decimal),
              ancho: DecimalUtil.roundToDecimals(this.ensureNumber(row.ancho), this.var_decimal),
              area: DecimalUtil.roundToDecimals(this.ensureNumber(row.area), this.var_decimal),
              area_total: v_area_total,
              volumen_total: v_volumen_total,
              volumen: DecimalUtil.roundToDecimals(this.ensureNumber(row.volumen), this.var_decimal),
              parcial: calculoparcial,
              // id_tipo_computo: dataadicional.id_tipo_computo,
              version: nueva_version,
              // observacion_fiscal: '',
              id_usuario_registro: dataadicional.id_usuario,
              id_estado: 1,
            } as DeepPartial<Computo>;

          }
          return null; // Si no cumple, no se guarda     
        }     
        });
        // await this.computoRepositorio.save(batch);

        // Resolvemos las promesas
        const batchResolved = (await Promise.all(batch))
          .filter((item): item is DeepPartial<Computo> => item !== null);

        // Guardamos solo si hay registros
        if (batchResolved.length > 0) {
          await this.computoRepositorio.save(batchResolved);
        }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////      
      const datos = {
        id_modificacion_pago: dataadicional.id_modificacion,
        id_item: 0
      }
      //actualizar toda la planilla 30052025 
      await this.planillaService.actualizarPlanilla(datos);

      //para no insertar justificacion si es pago
      /*  const tipo_modificacion = await this.modificacionService.findOne(dataadicional.id_modificacion ?? 0);
        const v_id_tipo_mod_pago = info_obra.data.id_tipo_mod_pago;*/
      if (!tipo_modificacion || tipo_modificacion.data.length === 0) {
        console.warn(`no existe tipo de modificacion pago para justificacion ${dataadicional.id_modificacion} not found`);
      }

      if (v_id_tipo_mod_pago < 4) {

        await this.insertarJustificacion(datosExcel, dataadicional.id_usuario, dataadicional.id_sol_historial, dataadicional.id_modificacion);
      }
    } catch (error: any) {
      await this.logService.create({
        id_usuario: dataadicional?.id_usuario || 0,
        mensaje: 'Error al insertar datos de cómputos métricos',
        funcionalidad: 'insertar-DatosLotesExcel',
        parametro: JSON.stringify(dataadicional),
        respuesta: error.message
      });
      throw new Error(`Error al insertar datos en la base de datos: ${error.message}`);
    }
  }

  /**
   * Asegura que el valor sea un número, reemplazando valores nulos o vacíos por 0.
   * @param value El valor a validar.
   */
  /*private ensureNumber(value: any): number {
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  }*/

  private ensureNumber(value: any): number {
    // Convertir el valor a un número si es válido y devolverlo; de lo contrario, devolver 0.
    const parsedValue = parseFloat(value);
    return !isNaN(parsedValue) && value !== null && value !== '' ? parsedValue : 0;
  }

  async copiarComputoaHistorico(data: any) {
    try {
      let query =
        `           
            INSERT INTO public.computo_historico(id_modificacion_pago, data_json,  version,  id_usuario_registro,
            id_estado)

            SELECT  $1 as id_modificacion_pago, 
            jsonb_agg(jsonb_build_object('id_computo', id_computo, 'id_item' , id_item,  'tramo',  tramo, 'descripcion', descripcion, 'numero_veces', numero_veces,
            'alto', alto, 'largo',  largo, 'ancho', ancho, 'area', area, 'area_total',  area_total,  'volumen', volumen, 
            'volumen_total', volumen_total, 'parcial',  parcial, 
            'id_usuario_registro', id_usuario_registro, 'fecha_registro', fecha_registro, 'fecha_modificacion', fecha_modificacion, 
            'id_estado', id_estado)) as data_json,
            version , $2, 1
            FROM public.computo WHERE id_modificacion_pago= $1
            GROUP BY id_modificacion_pago, version;          
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
                  FROM public.computo_historico WHERE id_modificacion_pago =$1;`;
    const param = [modificacion]
    const result = await this.computoRepositorio.query(query, param);
    console.log('result.rows[0]?.max_version', result[0].max_version || 0);
    return result[0]?.max_version || 0;

  }


  async deleteXModificacion(modificacion: number): Promise<number> {
    const query = `DELETE FROM public.computo WHERE id_modificacion_pago =$1;`
    const param = [modificacion]
    const result = await this.computoRepositorio.query(query, param);
    return result;
  }



  async listaResumenXModifiacion(data: ComputoResumenDto) {
    try {
      let query = `           
             SELECT * FROM public.sp_modificacion_x_resumen() WHERE id_modificacion_pago =$1      
          `;
      const params: any[] = [data.id_modificacion_pago];
      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }




  async validarObservacion(data: ComputoItemDto): Promise<{ tieneObservacion: boolean, registros: any[] }> {
    const query = `
    SELECT id_item, observacion_fiscal, id_modificacion_pago FROM public.computo  as c
INNER JOIN public.computo_observacion  AS co ON c.id_computo = co.id_computo
    WHERE  id_item =$1 AND id_modificacion_pago =$2 `;
    const params = [data.id_item, data.id_modificacion_pago];

    const result = await this.computoRepositorio.query(query, params);
    const rows = result ?? [] // ✅ Si rows es undefined, asigna un array vacío    
    // Verificar si al menos una observación tiene un valor no vacío
    const tieneObservacion = rows.length > 0 && rows.some((row: { observacion_fiscal: string }) =>
      typeof row.observacion_fiscal === 'string' && row.observacion_fiscal.trim() !== ''
    )
    return { tieneObservacion, registros: rows };

  } catch(error: any) {
    console.error('Error en la consulta:', error);
    return { tieneObservacion: false, registros: [] }; // ✅ Manejar errores correctamente
  }



  ////////////////////////////COMPUTO OBSERVACION//////////////////////////////////

  // async createComputoObservacion(createComputoDto: CreateComputoObservacionDto) {
  //   try {
  //     console.log('createComputoDto', createComputoDto);

  //     const resultado = await this.computoObsRepositorio.save(createComputoDto);
  //     console.log('resultado', resultado );
  //     return this.responseService.success(resultado, "Registrado Correctamente.")
  //   } catch (error) {
  //     return this.responseService.error(error);
  //   }
  // }

  async createComputoObservacion(createComputoDto: CreateComputoObservacionDto) {
    try {
      const { id_computo, id_solicitud_historial, observacion_fiscal, id_usuario_registro, id_estado } = createComputoDto;

      const query = `SELECT public.sp_modificacion_computo_observacion($1, $2, $3, $4, $5) as mensaje`;
      const params = [id_computo, id_solicitud_historial, observacion_fiscal, id_usuario_registro, id_estado];

      const result = await this.computoObsRepositorio.query(query, params);
      const mensaje = result[0]?.mensaje ?? 'Operación completada.';

      return this.responseService.success({ mensaje }, mensaje);
    } catch (error) {
      return this.responseService.error(error, 'Error al registrar/modificar la observación.');
    }
  }

  async listarComputoObservaciones(id_computo: number): Promise<any> {
    try {
      const query = `SELECT * FROM sp_computo_observacion_listar($1)`;
      const resultado = await this.computoObsRepositorio.query(query, [id_computo]);

      return this.responseService.success(resultado, 'Observaciones listadas correctamente.');
    } catch (error) {
      return this.responseService.error(error, 'Error al listar observaciones de cómputo.');
    }
  }





}
