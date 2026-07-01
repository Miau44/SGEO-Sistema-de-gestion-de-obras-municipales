import { BadRequestException, Controller, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';
import { ResponseService } from 'src/response.service';
import { ItemObraDto } from './dto/item-obra.dto';
import { ItemAdjudicadoDto } from './dto/update-item-adjudicado.dto';
import { ExternoService } from 'src/schema_private/externo/externo.service';
import { ItemEstadoDto } from './dto/item-estado.dto';
import { ItemFinalizarDto } from './dto/item-finalizar.dto';
import { CreateModificacionDto } from '../modificacion_pago/dto/create-modificacion.dto';
import { Modificacion } from '../modificacion_pago/entities/modificacion.entity';

import { FormatoNumericoUtil } from 'src/common/utils/formato-numerico.utils';
import { PlanillaService } from '../planilla/planilla.service';
import { ObraService } from '../obra/obra.service';
import { DecimalUtil } from 'src/common/utils/numero-decimales.utils';
import { ItemObraContratoDto } from './dto/obra-contrato.dto';
import { CreateItemAvanceDto } from './dto/create-item-avance.dto';
import { AvanceItemDto } from './dto/item-avance.dto';
import { ItemAvance } from './entities/avance_item.entity';
import { log } from 'node:console';
import { ItemEstadoAvanceDto } from './dto/item-estado-avance.dto';

@Injectable()
export class ItemService {

  //private var_decimal = 2; // valor por defecto

  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemAvance)

    private readonly itemAvanceRepository: Repository<ItemAvance>,

    //    @InjectRepository(Modificacion) private modificacionRepo: Repository<Modificacion>,

    private responseService: ResponseService,
   // private externoService: ExternoService,
    private planillaService: PlanillaService,
    private obraService: ObraService,

  ) { }

  // Crear un nuevo item


  async create(createItemDto: CreateItemDto) {
    try {
      const resultado = await this.itemRepository.save(createItemDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  

  async guardarItemNuevos(createItemDto: CreateItemDto) {
    try {

      const queryObra =
        `SELECT  COUNT(*) 
         FROM item WHERE id_obra = $1 AND id_estado = 1;`;
      const values = [createItemDto.id_obra];
      const result = await this.itemRepository.query(queryObra, values);
      const nuevoOrden = parseInt(result[0].count, 10);
      //return productCount;
      let numero_correlativo = nuevoOrden + 1
      const queryObra1 = `
      SELECT codigo_item
      FROM item WHERE id_obra = $1 AND codigo_item = $2 AND id_estado = 1;`;
      const parametros = [createItemDto.id_obra, createItemDto.codigo_item];
      const existente = await this.itemRepository.query(queryObra1, parametros);
      if (existente.length > 0) {
        return this.responseService.error("Ítem existente: El ítem que intenta guardar ya está registrado en la Obra. Por favor verifique.");
      }
      else {
        createItemDto.orden_sim = numero_correlativo; // Asignar el nuevo orden
        if (numero_correlativo > 0) {
          const resultado = await this.itemRepository.save(createItemDto);

          // nuevo CREAR PLANILLA ITEM
          const datos = {
            id_item: resultado.id_item,
            id_modificacion_pago: createItemDto.id_modificacion_pago,
            id_usuario_registro: resultado.id_usuario_registro
          }
          await this.planillaService.copiarItemXItem(datos)
          //FIN CREAR PLANILLA ITem
          return this.responseService.success(resultado, "Registrado Correctamente.")

        }
      }
      
    } catch (error) {
      return this.responseService.error(error);
    }
  }    

  // Obtener todos los items
  //async findAll(): Promise<Item[]> {
  async findAll() {
    try {
      const resultado = await this.itemRepository.find();
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  // Obtener un item por id
  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id_item: id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

 async findItem(id_item: number) {

    try {
      const resultado = await this.itemRepository.findOneBy({ id_item: id_item });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  // Actualizar un item por id
  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {

    await this.itemRepository.update(id, updateItemDto);
    return this.findOne(id);  // Devolver el item actualizado

  }

  async updateItem(id: number, updateItemDto: UpdateItemDto) {
    try {

     /* const obra = await this.obraService.findOne(updateItemDto.id_obra);
      if (!obra || !obra.data || obra.data.length === 0) {
        throw new NotFoundException(`Obra with ID ${updateItemDto.id_obra} not found`);
      }

      const modalidad = obra.data[0].modalidad;
      console.log('modalidad', modalidad);
      this.var_decimal = modalidad === 'CONTRATACION DIRECTA' ? 2 : 5;

      const precio_adjudicado = DecimalUtil.roundToDecimals(this.ensureNumber(updateItemDto.p_unitario_adjudicado), this.var_decimal);
      updateItemDto.p_unitario_adjudicado = precio_adjudicado;
      var total_adjudicado = DecimalUtil.roundToDecimals(this.ensureNumber(updateItemDto.p_unitario_adjudicado* 52.75), this.var_decimal);
      console.log('total_adjudicado', total_adjudicado);
      
      updateItemDto.total_adjudicado = total_adjudicado;
      //console.log('UpdateItemDto2hoy29', updateItemDto);*/

    const query = `SELECT * FROM  public.sp_update_item_x_item(${id}, ${updateItemDto.id_obra}, ${updateItemDto.p_unitario_adjudicado});`;
//SELECT * FROM  public.sp_update_item_x_item(7945, 450, 21.18)
const resultado = await this.itemRepository.query(query);
    //  const resultado = await this.itemRepository.update(+id, updateItemDto);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  private ensureNumber(value: any): number {
    // Convertir el valor a un número si es válido y devolverlo; de lo contrario, devolver 0.
    const parsedValue = parseFloat(value);
    return !isNaN(parsedValue) && value !== null && value !== '' ? parsedValue : 0;
  }


  // Eliminar un item por id
  async remove(id: number): Promise<void> {
    await this.itemRepository.delete(id);
  }


  async listarItemsXObra(data: ItemObraDto) {
    try {
      const query = ` 
	      SELECT * FROM sp_items_x_obra($1);
      `;
      const param = [data.id_obra]
      const resultado = await this.itemRepository.query(query, param);
      return this.responseService.success(resultado, "Listado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listarItemsXObraXTipo(data: ItemObraDto) {
    try {
      const query = ` 

      SELECT i.id_item, i.orden_sim,            
      f.desc_carpeta, i.codigo_item, i.unidad_medida_sim, i.desc_item, 
      public.formato_numerico(i.cantidad_sim,2) as cantidad_sim,	 
      public.formato_numerico(i.p_unitario_sim,2) as p_unitario_sim,	  
      public.formato_numerico(i.total_item_sim,2) as total_item_sim,	  
     public.formato_numerico(i.p_unitario_adjudicado,5) as p_unitario_adjudicado,	  
      public.formato_numerico(i.total_adjudicado,5) as total_adjudicado	, i.finalizado   
      FROM public.obra AS o
      INNER JOIN public.item  AS i ON o.id_obra = i.id_obra
      INNER JOIN public.ficha AS f ON o.id_ficha = f.id_ficha
      WHERE i.id_obra =$1 AND i.id_tipo_item =$2 AND i.id_estado =1  ORDER BY i.orden_sim ASC`;
      const param = [data.id_obra, data.id_tipo_item]
      const resultado = await this.itemRepository.query(query, param);
      return this.responseService.success(resultado, "Listado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }  

  async exportarItems(data: ItemObraDto) {
    try {
      const query = ` 
      SELECT * FROM public.item WHERE id_obra=$1 AND id_estado=1`;
      const param = [data.id_obra]
      const resultado = await this.itemRepository.query(query, param);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  //menu asignaciones general
  async listaItemSGPU(data: ItemObraDto) {
    try {
      //externo sistema seguridad
      // const datosSeguridad = 'http://192.168.8.4:84/api/v1/servicio/listarUsuariosXcodigouo';

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        /*  body: JSON.stringify(
            estructuraGralDto
          ),*/
        };
       
        
  
        const query = `SELECT * FROM public.item WHERE id_obra =$1	LIMIT 10`;
        const params = [data.id_obra];
        /*const resultadoSgeo: any[] = await this.itemRepository.query(query, params);
        const resultadoSgpu: any[] = await this.externoService.sgpuItemsVigentes();   
        
     
        const resultado = resultadoSgpu.map(datossgpu => {
          const itemsNuevos = resultadoSgeo.filter(sgeo => sgeo.codigo_item === datossgpu.codigoItem);

          console.log('resultado', itemsNuevos);  
          return { datossgpu, sgeo:itemsNuevos };*/

     /*     const resultadoSgeo: any[] = await this.itemRepository.query(query, params);
          const resultadoSgpu: any = await this.externoService.sgpuItemsVigentes(data);
          
          // Obtener solo los elementos de `resultadoSgeo` que no están en `resultadoSgpu`
          const noEnSgpu = resultadoSgeo.filter(
            sgeo => !resultadoSgpu.some((sgpu:any) => sgpu.codigoItem === sgeo.codigo_item)
          );
          
          // Obtener solo los elementos de `resultadoSgpu` que no están en `resultadoSgeo`
          const noEnSgeo = resultadoSgpu.filter(
            (sgpu:any) => !resultadoSgeo.some(sgeo => sgeo.codigo_item === sgpu.codigoItem)
          );*/
          
          // Unir los resultados si es necesario
          const resultado = {
         //   noEnSgpu, // Elementos en Sgeo que no están en Sgpu
         //   noEnSgeo, // Elementos en Sgpu que no están en Sgeo
          };
          
      
          
    
        return this.responseService.success(resultado, "Listado Correctamente.")
      } catch (error) {
        return this.responseService.error(error);
      }
  
  
    }


  //actualizar items monto adjudicado en bloque
  async updateItemBloque(registros: ItemAdjudicadoDto[]) {
    try {
      if (!Array.isArray(registros) || registros.length === 0) {
        return this.responseService.error('No hay registros para procesar.');
      }

      const resultados = [];

      for (const registro of registros) {
        try {
          const id_obra = await this.findOne(registro.id_item);
          // const obra = await this.obraService.findOne(id_obra.id_obra);
          if (!id_obra) {
            throw new NotFoundException(`Obra with ID ${id_obra} not found`);
          }
          const valorDecimales: number = await this.itemObraModalidad({ id_obra: id_obra.id_obra });
          // ✅ Convertimos a tipo EXACTO 2 | 5
          const var_decimal: 2 | 5 = valorDecimales === 5 ? 5 : 2;
          var p_unitario_adjudicado_ = FormatoNumericoUtil.desformatearNumero(registro.p_unitario_adjudicado?.toString() || '0')
          var total_adjudicado_ = FormatoNumericoUtil.desformatearNumero(registro.total_adjudicado?.toString() || '0')

          const data = {
            p_unitario_adjudicado: DecimalUtil.roundToDecimals((this.ensureNumber(p_unitario_adjudicado_)), var_decimal),
            total_adjudicado: DecimalUtil.roundToDecimals(this.ensureNumber(total_adjudicado_), var_decimal)
          };

          const resultado = await this.itemRepository.update({ id_item: registro.id_item }, data);
          // const resultado = await this.updateItem(registro.id_item, data);          

          if (typeof resultado.affected === 'number' && resultado.affected > 0) {
            resultados.push({ id_item: registro.id_item, estado: 'Actualizado', data });
          } else {
            resultados.push({ id_item: registro.id_item, estado: 'No encontrado o sin cambios' });
          }
        } catch (error: any) {
          resultados.push({ id_item: registro.id_item, estado: 'Error', error: error.message });
        }
      }

      return this.responseService.success(resultados, 'Proceso completado.');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  private formatMonto(monto: string | number): string {
    if (typeof monto === 'string') {
      // Remover comas y convertir a número
      monto = parseFloat(monto.replace(',', ''));
    }
    // Formatear el número a 5 decimales y convertirlo de nuevo a formato string con coma
    return monto.toFixed(5).replace('.', ',');
  }
    
    

 /* async actualizarEstado(data: ItemEstadoDto) {
    try {
      let query =
        ` UPDATE public.item 
        SET id_estado =$2 WHERE id_item = $1 AND id_estado = 1`;
      const params: any[] = [data.id_item, data.id_estado];
      const resultado: any[] = await this.itemRepository.query(query, params);
      
    
	

        //PARA ELIMINAR PLANILLA
        let queryEliminarPlanilla =
        ` UPDATE public.planilla 
        SET id_estado =0  WHERE id_item = $1 AND id_modificacion_pago =$2  AND id_estado = 1`;
           const param2=[data.id_item, data.id_modificacion_pago];      
     await this.itemRepository.query(queryEliminarPlanilla, param2);  
     //nuevo codigo

      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
*/

  async finalizarOrdenItem(data: ItemFinalizarDto) {
    try {
      let query =
        ` SELECT  id_item, id_tipo_item,  id_estado FROM public.item 
        WHERE id_obra =$1 AND id_tipo_item =265 AND id_estado =1`;
      const params = [data.id_obra];
      const v_data_items = await this.itemRepository.query(query, params);

      if (!v_data_items.length) { return this.responseService.success("No hay datos para actualizar.") }
      let v_max_orden = await this.getMaxOrdenItem(data.id_obra) ?? 0; 

      for (const item of v_data_items) {
        if (!item?.id_item) continue; // Verifica que el item tenga un id válido

        const nuevo_orden = ++v_max_orden; // Incrementar antes de asignar

        if (isNaN(nuevo_orden)) {
          console.error(`Error: nuevo_orden es NaN para item ${item.id_item}`);
          continue;
        }

        await this.updateItem(item.id_item, { orden_sim: nuevo_orden, finalizado: true });
        const datos = {
          id_item: item.id_item,
          id_modificacion_pago: data.id_modificacion_pago,
          id_usuario_registro: data.id_usuario_registro

        }

        await this.planillaService.copiarItemXItem(datos)
      }
      return this.responseService.success("Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }





  }


  async getMaxOrdenItem(id_obra: number): Promise<number> {
    const query = `SELECT COALESCE(MAX(orden_sim), 0) AS max_orden
                  FROM public.item WHERE id_obra =$1 AND id_estado=1;`;
    const param = [id_obra]
    const result = await this.itemRepository.query(query, param);
    return result[0].max_orden || 0;

  }


  async finalizarItem(data: ItemFinalizarDto) {
    try {
      let query =
        ` UPDATE public.item 
        SET finalizado =true, fecha_modificacion = NOW() WHERE id_obra = $1 AND id_estado = 1  AND id_tipo_item =264; `;
      const params = [data.id_obra];
      const resultado = await this.itemRepository.query(query, params);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }


  }
  
   async actualizarEstado(data: ItemEstadoDto) {
    try {
      let query =
        ` UPDATE public.item 
        SET id_estado =$2 WHERE id_item = $1 AND id_estado = 1`;
      const params: any[] = [data.id_item, data.id_estado];
      const resultado: any[] = await this.itemRepository.query(query, params);
      //PARA REORDENAR

      const queryDefault = `
      SELECT id_obra,  orden_sim FROM public.item 
      WHERE  id_obra = $1 AND id_tipo_item = 264 AND id_estado = 1 ORDER BY orden_sim asc;
    `;
      const params1: any[] = [data.id_obra];
      const itemsPorDefecto = await this.itemRepository.query(queryDefault, params1);
      const cantidadPorDefecto = itemsPorDefecto.length;

      const queryAgregados = `
      SELECT id_item,  orden_sim FROM public.item 
      WHERE id_obra = $1 AND  id_tipo_item = 265 AND id_estado = 1  ORDER BY orden_sim asc;`;
      const params2: any[] = [data.id_obra];
      const itemsAdicionales = await this.itemRepository.query(queryAgregados, params2);
      const updates = [];
      let nuevoOrden = cantidadPorDefecto + 1;
      for (const prod of itemsAdicionales) {
        const updateQuery = `
        UPDATE public.item SET orden_sim = $1, fecha_modificacion = NOW()  WHERE id_item = $2;`;
        await this.itemRepository.query(updateQuery, [nuevoOrden, prod.id_item]);
        nuevoOrden++;
      }
      //PARA ELIMINAR PLANILLA
      let queryEliminarPlanilla =
        ` UPDATE public.planilla 
        SET id_estado =0  WHERE id_item = $1 AND id_modificacion_pago =$2  AND id_estado = 1;`;
      const param2 = [data.id_item, data.id_modificacion_pago];
      await this.itemRepository.query(queryEliminarPlanilla, param2);
      //nuevo codigo

      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }




  async itemObraModalidad(dtoItem: ItemObraContratoDto): Promise<number> {
    const query = `SELECT * FROM public.sp_item_obra_contrato($1);`;
    const params = [dtoItem.id_obra];

    const resultado = await this.itemRepository.query(query, params);
    const modalidad = resultado[0];

    if (!modalidad) {
      throw new NotFoundException(`Modalidad not found for Obra ID ${dtoItem.id_obra}`);
    }
    return modalidad.cantidad_decimales ?? 2; // Devuelve number
  }


  //avance por item paola 1072026
  async createItenAvance(create: CreateItemAvanceDto) {
    try {

      const mayorAvance = await this.itemAvanceRepository
        .createQueryBuilder('item_avance')
        .select('MAX(item_avance.porcentaje_avance)', 'max')
        .where('item_avance.id_item = :id_item', { id_item: create.id_item })
        .getRawOne();
      const avanceMaximoActual = mayorAvance?.max ? Number(mayorAvance.max) : 0;

      if (create.porcentaje_avance <= avanceMaximoActual) {
        return this.responseService.error(
          `No se puede registrar un avance menor al ya existente. El avance actual es de ${avanceMaximoActual}%.`
        );
      }
      try {
   
        const resultado = await this.itemAvanceRepository.save(create);


      let query = ` SELECT public.fn_actualizar_total_avance($1);`;
      const params = [resultado.id_item];
      const resultado2 = await this.itemAvanceRepository.query(query, params);

      return this.responseService.success(resultado, "Registrado Correctamente.");
        return this.responseService.success(resultado, "Registrado Correctamente.");
      } catch (error: any) {
        // Este catch solo atrapará errores reales de Postgres (caídas de red, llaves foráneas inválidas, etc.)
        return this.responseService.error(error.message || "Error en la base de datos");
      }


    } catch (error) {
      return this.responseService.error(error);
    }
  }



  async listaAvanceXItem(data: AvanceItemDto) {
    try {
      const datos = {
        id_item: data.id_item,
        id_modificacion_pago: data.id_modificacion_pago
      }
      await this.planillaService.actualizarPlanillaXIditem(datos);

      let query = ` SELECT * FROM public.sp_computo_monto($1, $2);`;

      const params = [data.id_item, data.id_modificacion_pago];
      const resultado = await this.itemRepository.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  
async findOneItemAvance(id_item: number) {
  try {
    // CORRECCIÓN: Agregamos el objeto 'where' para la búsqueda
    const resultado = await this.itemAvanceRepository.find({
      where: { id_item: id_item } // O simplemente { where: { id_item } }
    });
    
    return this.responseService.success(resultado, "Listado Correctamente.");
  } catch (error) {
    return this.responseService.error(error);
  }
}



  async actualizarEstadoAvance(data: ItemEstadoAvanceDto) {
    try {
      let query =
        ` UPDATE public.item_avance 
        SET id_estado =0 WHERE id_item_avance = $1 AND id_estado = 1`;
      const params: any[] = [data.id_item_avance];
      const resultado: any[] = await this.itemRepository.query(query, params);
    }
  catch (error) {
    return this.responseService.error(error);
  }
}
}


