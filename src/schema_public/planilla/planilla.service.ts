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
import { log } from 'console';
import { FinalizarPlanillaDto } from './dto/finalizar-planilla.dto';

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


  async deletePlanillaObservacionExcel(id_modificacion: number) {
    try {

    /*  DELETE FROM public.planilla_observacion po
      WHERE EXISTS (
        SELECT 1 FROM public.planilla p
        WHERE po.id_planilla = p.id_planilla
        AND p.id_modificacion_pago = ${id_modificacion}
      ); */      
      let query1 = ` 
      
      DELETE FROM public.planilla_observacion po
      WHERE EXISTS (
      SELECT * FROM public.planilla AS p
      INNER JOIN public.modificacion_pago AS mp ON p.id_modificacion_pago = mp.id_modificacion_pago
      LEFT JOIN ( SELECT id_solicitud_historial, id_solicitud FROM  public.solicitud_historial  ORDER BY id_solicitud_historial DESC LIMIT 1)
      AS sh ON mp.id_solicitud = sh.id_solicitud  
      WHERE p.id_modificacion_pago = 23 
      AND  sh.id_solicitud_historial = 271  AND p.id_estado =1
      );      
      
      
      
      `;
      await this.planillaRepositorio.query(query1);
      const resultado: any[] = await this.planillaRepositorio.query(query1);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error: any) {
      console.error("Error al actualizar justificación:", error); // Log detallado en consola
      return this.responseService.error({
        mensaje: "Ocurrió un error al actualizar la justificación.",
        detalle: error.message || error,
      });
    }
  }

  async actualizarJustificacionXItem(data: actualizarJustificacionDto) {
    try {
      let query =
        /*
        UPDATE public.planilla 
                SET justificacion_supervisor =$2 WHERE id_item = $1 AND id_modificacion_pago= $3 AND id_estado = 1                         
        */
        ` 
        INSERT INTO public.planilla_observacion(
        id_planilla, id_solicitud_historial, justificacion_supervisor, observacion_fiscal, id_usuario_registro,  id_estado)

        SELECT DISTINCT p.id_planilla, COALESCE(sh.id_solicitud_historial, 0), '${data.justificacion_supervisor}' as justificacion_supervisor , '' as observacion_fiscal, 9820 as  id_usuario_registro, 1 as id_estado FROM public.computo AS c	
        INNER JOIN public.planilla AS p ON c.id_modificacion_pago = p.id_modificacion_pago AND c.id_item = p.id_item
        INNER JOIN public.modificacion_pago AS mp ON p.id_modificacion_pago = mp.id_modificacion_pago
        LEFT JOIN ( SELECT id_solicitud_historial, id_solicitud FROM  public.solicitud_historial  ORDER BY id_solicitud_historial DESC LIMIT 1)
        AS sh ON mp.id_solicitud = sh.id_solicitud  
        WHERE c.id_modificacion_pago = $1 AND  p.id_item = $2  AND p.id_estado =1;   `;
      const params: any[] = [data.id_modificacion_pago, data.id_item];

      /*  const consultaGenerada = query.replace(/\$\d+/g, (match) => {
          const index = parseInt(match.replace('$', ''), 10) - 1;
          return `'${params[index]}'`;
        });  
        console.log("Consulta SQL generada:\n", consultaGenerada);   */

      const resultado: any[] = await this.planillaRepositorio.query(query, params);

      log('Consulta generada insertar justificacion:', await this.planillaRepositorio.query(query)); // Imprimir la consulta en el log
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error: any) {
      console.error("Error al actualizar justificación:", error); // Log detallado en consola
      return this.responseService.error({
        mensaje: "Ocurrió un error al actualizar la justificación.",
        detalle: error.message || error,
      });
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



      let query = 'SELECT * FROM public.computo WHERE id_item = $2 AND id_modificacion_pago =$1';
      const params = [data.id_modificacion_pago, data.id_item];
      const rowCount = await this.planillaRepositorio.query(query, params);
      let resultado;


      if (rowCount.length > 0) {
        // Si hay datos, actualizar con los valores de la tabla
        let query2 =
          `UPDATE public.planilla AS p
            SET cantidad_planilla = COALESCE(subc.cantidad_planilla, 0), 
            monto_planilla = COALESCE(subc.monto_planilla, 0),
            cantidad_reordenamiento = COALESCE(subc.cantidad_reordenamiento, 0),
            total_reordenamiento = COALESCE(subc.total_reordenamiento, 0)
            FROM (
            SELECT i.p_unitario_adjudicado, ROUND(i.cantidad_autorizada,2), ROUND(SUM(parcial),5), c.id_item as id_itemc, i.id_item,  p.id_modificacion_pago,  
            ROUND(SUM(parcial),5) as cantidad_planilla, 
            ROUND((SUM(parcial) * SUM(total_adjudicado)),5) AS monto_planilla, 
            SUM(CASE WHEN parcial >= 0 THEN parcial ELSE 0 END) AS incremento,
            SUM(CASE WHEN parcial < 0 THEN parcial ELSE 0 END) AS decremento,	
            (ROUND(i.cantidad_autorizada,2) +  ROUND(SUM(parcial),5)) as cantidad_reordenamiento,  
            ROUND(((ROUND(i.cantidad_autorizada,2) +  ROUND(SUM(parcial),5)) * p_unitario_adjudicado),5) AS total_reordenamiento	
            FROM public.computo AS c 
            RIGHT JOIN public.item AS i ON c.id_item = i.id_item
            RIGHT JOIN public.planilla AS p  ON i.id_item = p.id_item
            WHERe  p.id_modificacion_pago =$1 AND  c.id_modificacion_pago =$1 AND  c.id_item = $2 AND i.id_estado =1
            GROUP BY c.id_item, i.id_item, p.id_modificacion_pago 
            ) AS subc
            WHERE p.id_modificacion_pago = $1 AND p.id_item = $2  `;
        resultado = await this.planillaRepositorio.query(query2, params);

      } else {
        // Si no hay datos, actualizar con valores en 0
        let query3 =
          `UPDATE public.planilla
          SET cantidad_planilla = 0, 
          monto_planilla = 0,
          cantidad_reordenamiento = 0,
          total_reordenamiento = 0
          WHERE id_modificacion_pago = $1 AND id_item = $2   `;
        resultado = await this.planillaRepositorio.query(query3, params);
      }

      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }



  async finalizarPlanilla(data: FinalizarPlanillaDto) {
    try {
      let query =
        ` UPDATE public.planilla 
          SET finalizado =true WHERE id_modificacion_pago = $1 AND id_estado = 1`;
      const params = [data.id_modificacion_pago];
      await this.planillaRepositorio.query(query, params);

      let queryrespuesta = `SELECT finalizado, id_modificacion_pago  FROM planilla WHERE id_modificacion_pago = $1 AND id_estado = 1 `;

      const resultado = await this.planillaRepositorio.query(queryrespuesta, params);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }




}
