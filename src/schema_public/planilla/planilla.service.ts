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
        ` UPDATE public.planilla AS p
        SET cantidad_planilla = subc.cantidad_planilla, 
        monto_planilla = subc.monto_planilla,
        cantidad_reordenamiento = subc.cantidad_reordenamiento
        FROM (
        SELECT  i.id_item, p.id_modificacion_pago,  SUM(parcial) as cantidad_planilla, 
        (SUM(parcial) * SUM(total_adjudicado)) AS monto_planilla, 
        SUM(CASE WHEN parcial >= 0 THEN parcial ELSE 0 END) AS incremento,
        SUM(CASE WHEN parcial < 0 THEN parcial ELSE 0 END) AS decremento,	
        (i.cantidad_sim +  SUM(parcial)) as cantidad_reordenamiento,  
        ((i.cantidad_sim +  SUM(parcial)) * p_unitario_adjudicado) AS total_reordenamiento
        FROM public.computo AS c 
        INNER JOIN public.item AS i ON c.id_item = i.id_item
        INNER JOIN public.planilla AS p  ON i.id_item = p.id_item
        WHERe  p.id_modificacion_pago =$1 AND i.id_estado =1
        GROUP BY i.id_item, p.id_modificacion_pago) AS subc
        WHERE p.id_item = subc.id_item AND p.id_modificacion_pago = subc.id_modificacion_pago
`;

      const params: any[] = [data.id_modificacion_pago];
      const resultado: any[] = await this.planillaRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


}
