import { Controller, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    //    @InjectRepository(Modificacion) private modificacionRepo: Repository<Modificacion>,

    private responseService: ResponseService,
    private externoService: ExternoService,
    private planillaService: PlanillaService

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

      const existente = await this.itemRepository.findOne({ where: {  codigo_item: createItemDto.codigo_item,  id_estado: 1  } });

      if (!existente) {      
      const resultado = await this.itemRepository.save(createItemDto);

      return this.responseService.success(resultado, "Registrado Correctamente.")      
      }
      else {

        return this.responseService.error( "El ítem ya existe. No puede guardar.")      
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

  // Actualizar un item por id
  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {

    await this.itemRepository.update(id, updateItemDto);
    return this.findOne(id);  // Devolver el item actualizado

  }

  async updateItem(id: number, updateItemDto: UpdateItemDto) {
    try {

     

      const resultado = await this.itemRepository.update(+id, updateItemDto);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  
  // Eliminar un item por id
  async remove(id: number): Promise<void> {
    await this.itemRepository.delete(id);
  }


  async listarItemsXObra(data: ItemObraDto) {
    try {
      const query = ` 

      SELECT i.id_item, i.orden_sim,  i.codigo_item, i.unidad_medida_sim, i.desc_item, 
     /* REPLACE(to_char(i.cantidad_sim,'999G999G999G999D99'), ' ', '') as cantidad_sim,	 
      REPLACE(to_char(i.p_unitario_sim,'999G999G999G999D99'), ' ', '') as p_unitario_sim,	  
      REPLACE(to_char(i.total_item_sim,'999G999G999G999D99'), ' ', '') as total_item_sim,	  
      REPLACE(to_char(i.p_unitario_adjudicado,'999G999G999G999D99'), ' ', '') as p_unitario_adjudicado,	  
      REPLACE(to_char(i.total_adjudicado,'999G999G999G999D99'), ' ', '') as total_adjudicado,*/

      formato_numerico(i.cantidad_sim,2) as cantidad_sim,	 
      formato_numerico(i.p_unitario_sim,2) as p_unitario_sim,	
      formato_numerico(i.total_item_sim,2) as total_item_sim,	 
      formato_numerico(i.p_unitario_adjudicado, 5) as p_unitario_adjudicado,	
      formato_numerico(i.total_adjudicado, 5) as total_adjudicado,	 

    i.finalizado	  
      FROM public.obra AS o
      INNER JOIN public.item  AS i ON o.id_obra = i.id_obra
      INNER JOIN public.ficha AS f ON o.id_ficha = f.id_ficha
      WHERE i.id_obra =$1 AND  i.id_estado =1  ORDER BY i.orden_sim ASC`;
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

          const resultadoSgeo: any[] = await this.itemRepository.query(query, params);
          const resultadoSgpu: any[] = await this.externoService.sgpuItemsVigentes();
          
          // Obtener solo los elementos de `resultadoSgeo` que no están en `resultadoSgpu`
          const noEnSgpu = resultadoSgeo.filter(
            sgeo => !resultadoSgpu.some(sgpu => sgpu.codigoItem === sgeo.codigo_item)
          );
          
          // Obtener solo los elementos de `resultadoSgpu` que no están en `resultadoSgeo`
          const noEnSgeo = resultadoSgpu.filter(
            sgpu => !resultadoSgeo.some(sgeo => sgeo.codigo_item === sgpu.codigoItem)
          );
          
          // Unir los resultados si es necesario
          const resultado = {
            noEnSgpu, // Elementos en Sgeo que no están en Sgpu
            noEnSgeo, // Elementos en Sgpu que no están en Sgeo
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
          const data = {
            p_unitario_adjudicado: FormatoNumericoUtil.desformatearNumero(registro.p_unitario_adjudicado?.toString() || '0'),
            total_adjudicado: FormatoNumericoUtil.desformatearNumero(registro.total_adjudicado?.toString() || '0'),
          };

          const resultado = await this.itemRepository.update({ id_item: registro.id_item }, data);

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
    
    

  async actualizarEstado(data: ItemEstadoDto) {
    try {
      ;
      let query =
        ` UPDATE public.item 
        SET id_estado =$2 WHERE id_item = $1 AND id_estado = 1`;
      const params: any[] = [data.id_item, data.id_estado];
      const resultado: any[] = await this.itemRepository.query(query, params);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  


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
        SET finalizado =true WHERE id_obra = $1 AND id_estado = 1`;
      const params = [data.id_obra];
      const resultado = await this.itemRepository.query(query, params);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  

  }


}
