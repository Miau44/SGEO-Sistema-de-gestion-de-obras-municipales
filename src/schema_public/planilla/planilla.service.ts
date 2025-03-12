import { Injectable } from '@nestjs/common';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { Any, Repository } from 'typeorm';
import { Planilla } from './entities/planilla.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { copiarItemDto } from './dto/planilla-item.dto';
import { actualizarJustificacionDto } from './dto/actualizar-justificacion.dto';
import { actualizarPlanillaDto } from './dto/actualizar-planilla.dto';
import { CopiarPlanillaXItemDto } from './dto/copiar-x-item.dto';

@Injectable()
export class PlanillaService {

  constructor(
    @InjectRepository(Planilla) private planillaRepositorio: Repository<Planilla>,
    private responseService: ResponseService) { }


  async create(createPlanillaDto: CreatePlanillaDto) {
    try {
      const resultado = await this.planillaRepositorio.save(createPlanillaDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all planilla`;
  }

  findOne(id: number) {
    return `This action returns a #${id} planilla`;
  }

  async update(id: number, updatePlanillaDto: UpdatePlanillaDto) {
    try {
      const resultado = await this.planillaRepositorio.update(id, updatePlanillaDto)
      return this.responseService.success(id, "Actualizado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} planilla`;
  }

  async copiarItem(data: copiarItemDto) {
    try {
      ;
      let query =
        ` INSERT INTO public.planilla (id_modificacion_pago, id_item, monto_planilla, id_usuario_registro, id_estado)
        SELECT $1 as id_modificacion_pago, id_item, total_adjudicado, $3, 1 FROM public.item WHERE id_obra =$2 AND id_estado =1`;
      const params: any[] = [data.id_modificacion_pago, data.id_obra, data.id_usuario_registro,];
      const resultado: any[] = await this.planillaRepositorio.query(query, params);
      return this.responseService.success(resultado, "Creado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async copiarItemXItem(data: CopiarPlanillaXItemDto) {

    console.log('data', data);
    
    try {
      ;
      let query =
        ` INSERT INTO public.planilla (id_modificacion_pago, id_item, monto_planilla, id_usuario_registro, id_estado)
        SELECT $1 as id_modificacion_pago, id_item, total_adjudicado, $3, 1 FROM public.item WHERE id_item =$2 AND id_estado =1`;
      const params: any[] = [data.id_modificacion_pago, data.id_item, data.id_usuario_registro,];
      const resultado: any[] = await this.planillaRepositorio.query(query, params);
      return this.responseService.success(resultado, "Creado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async listaPlanillaXItemXModpago(data: actualizarJustificacionDto) {
    try {
      ;
      let query =
        ` SELECT * FROM public.planilla  WHERE id_item = $1 AND id_estado = 1 AND id_modificacion_pago= $2`;
      const params: any[] = [data.id_item,  data.id_modificacion_pago];
      const resultado: any[] = await this.planillaRepositorio.query(query, params);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


   

  async actualizarJustificacionXItem(data: actualizarJustificacionDto) {
    try {
      ;
      let query =
        ` UPDATE public.planilla 
        SET justificacion_supervisor =$2 WHERE id_item = $1 AND id_estado = 1 AND id_modificacion_pago= $3`;
      const params: any[] = [data.id_item, data.justificacion, data.id_modificacion_pago];
      const resultado: any[] = await this.planillaRepositorio.query(query, params);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }



  async actualizarPlanilla(data: actualizarPlanillaDto) {
    try {
      ;
      let query =
   
` 
        UPDATE public.planilla AS p
        SET cantidad_planilla = subc.cantidad_planilla, 
        monto_planilla = subc.monto_planilla,
        cantidad_reordenamiento = subc.cantidad_reordenamiento,
		total_reordenamiento = subc.total_reordenamiento
        FROM (
         SELECT c.id_item as id_itemc, i.id_item,  p.id_modificacion_pago,  
		ROUND(SUM(parcial),5) as cantidad_planilla, 
        ROUND((SUM(parcial) * SUM(total_adjudicado)),5) AS monto_planilla, 
        SUM(CASE WHEN parcial >= 0 THEN parcial ELSE 0 END) AS incremento,
        SUM(CASE WHEN parcial < 0 THEN parcial ELSE 0 END) AS decremento,	
        (ROUND(i.cantidad_autorizada,2) +  ROUND(SUM(parcial),5)) as cantidad_reordenamiento,  
        ROUND(((i.cantidad_autorizada +  ROUND(SUM(parcial),5)) * p_unitario_adjudicado),5) AS total_reordenamiento
        FROM public.computo AS c 
        INNER JOIN public.item AS i ON c.id_item = i.id_item
        INNER JOIN public.planilla AS p  ON i.id_item = p.id_item
        WHERe  p.id_modificacion_pago =$1 AND  c.id_modificacion_pago =$1    AND i.id_estado =1
        GROUP BY c.id_item, i.id_item, p.id_modificacion_pago ) AS subc
        WHERE p.id_item = subc.id_item AND p.id_modificacion_pago = subc.id_modificacion_pago;  `;      

      const params: any[] = [data.id_modificacion_pago];
      const resultado: any[] = await this.planillaRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }



  async actualizarPlanillaXIditem(data: actualizarPlanillaDto) {
    try {
      ;
      let query =
` 
        UPDATE public.planilla AS p
        SET cantidad_planilla = subc.cantidad_planilla, 
        monto_planilla = subc.monto_planilla,
        cantidad_reordenamiento = subc.cantidad_reordenamiento,
		total_reordenamiento = subc.total_reordenamiento
        FROM (
         SELECT c.id_item as id_itemc, i.id_item,  p.id_modificacion_pago,  
		ROUND(SUM(parcial),5) as cantidad_planilla, 
        ROUND((SUM(parcial) * SUM(total_adjudicado)),5) AS monto_planilla, 
        SUM(CASE WHEN parcial >= 0 THEN parcial ELSE 0 END) AS incremento,
        SUM(CASE WHEN parcial < 0 THEN parcial ELSE 0 END) AS decremento,	
        (ROUND(i.cantidad_autorizada,2) +  ROUND(SUM(parcial),5)) as cantidad_reordenamiento,  
        ROUND(((i.cantidad_autorizada +  ROUND(SUM(parcial),5)) * p_unitario_adjudicado),5) AS total_reordenamiento
        FROM public.computo AS c 
        INNER JOIN public.item AS i ON c.id_item = i.id_item
        INNER JOIN public.planilla AS p  ON i.id_item = p.id_item
        WHERe  p.id_modificacion_pago =$1 AND  c.id_modificacion_pago =$1  AND c.id_item = $2  AND i.id_estado =1
        GROUP BY c.id_item, i.id_item, p.id_modificacion_pago ) AS subc
        WHERE p.id_item = subc.id_item AND p.id_modificacion_pago = subc.id_modificacion_pago;  `;      

      const params: any[] = [data.id_modificacion_pago, data.id_item];
      const resultado: any[] = await this.planillaRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

}
