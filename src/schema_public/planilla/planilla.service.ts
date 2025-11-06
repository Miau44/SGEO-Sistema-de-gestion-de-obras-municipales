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
import { Log } from '../log/entities/log.entity';
import { actualizarObservacionDto } from './dto/planilla_observacion/actualizar-observacion.dto';
import { PlanillaItemDto } from './dto/obtener-planilla-item.dto';
import { Informe } from '../informe/entities/informe.entity';
import { InformeService } from '../informe/informe_inicial.service';

@Injectable()
export class PlanillaService {

  constructor(
    @InjectRepository(Planilla) private planillaRepositorio: Repository<Planilla>,
    private responseService: ResponseService,
    private informeService: InformeService,
  ) { }


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
      
      let query1 = ` 
      
      DELETE FROM public.planilla_observacion po
      WHERE EXISTS (
      SELECT * FROM public.planilla AS p
      INNER JOIN public.modificacion_pago AS mp ON p.id_modificacion_pago = mp.id_modificacion_pago
      LEFT JOIN ( SELECT id_solicitud_historial, id_solicitud FROM  public.solicitud_historial  ORDER BY id_solicitud_historial DESC LIMIT 1)
      AS sh ON mp.id_solicitud = sh.id_solicitud  
      WHERE p.id_modificacion_pago = 23 
      AND  sh.id_solicitud_historial = 271  AND p.id_estado =1
      ); `;

      const params: any[] = [id_modificacion];

      await this.planillaRepositorio.query(query1, params);

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

     // console.log('actualizarJustificacionDto', data);

    //  console.log('data actualizarJustificacionXItem', data);           
      let query =
      //ejemplo de la funcion
     // public.sp_modificacion_planilla_observacion(p_modificacion_pago,  p_item, p_solicitud_historial,  p_justificacion_supervisor, p_observacion_fiscal, p_usuario)
     //variables de la funcion
       //id_modificacion_pago:  $1
       //id_item: $2
       //id_solicitud_historial: $3
       //justificacion_supervisor:  $4
       //observacion_fiscal:    $5    
       //id_usuario_registro: $6
        `SELECT public.sp_modificacion_planilla_justificacion(
          $1,$2,$3,$4,$5) as resultado;`;
      const params: any[] = [data.id_modificacion_pago, data.id_item, data.id_solicitud_historial, 
        data.justificacion_supervisor,  data.id_usuario_registro];
      const resultado: any[] = await this.planillaRepositorio.query(query, params);
      //log('Consulta generada insertar justificacion:', await this.planillaRepositorio.query(query)); // Imprimir la consulta en el log
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error: any) {
      console.error("Error al actualizar justificación sp nuevo:", error); // Log detallado en consola
      return this.responseService.error({
        mensaje: "Ocurrió un error al actualizar la justificación.",
        detalle: error.message || error,
      });
    }
  }

    async actualizarObservacionXItem(data: actualizarObservacionDto) {
    try {

      console.log('actualizarJustificacionDto', data);

    //  console.log('data actualizarJustificacionXItem', data);           
      let query =
      //ejemplo de la funcion
      // public.sp_modificacion_planilla_observacion(p_modificacion_pago,  p_item, p_solicitud_historial,  p_justificacion_supervisor, p_observacion_fiscal, p_usuario)
      //variables de la funcion
        //id_modificacion_pago:  $1
        //id_item: $2
        //id_solicitud_historial: $3
        //justificacion_supervisor:  $4
        //observacion_fiscal:    $5    
        //id_usuario_registro: $6
        `SELECT public.sp_modificacion_planilla_observacion(
          $1,$2,$3,$4,$5,$6) as resultado;`;
      const params: any[] = [data.id_modificacion_pago, data.id_item, data.id_solicitud_historial, 
         data.observacion_fiscal, data.estado_observacion_fis, data.id_usuario_registro];
      const resultado: any[] = await this.planillaRepositorio.query(query, params);
      //log('Consulta generada insertar justificacion:', await this.planillaRepositorio.query(query)); // Imprimir la consulta en el log
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error: any) {
      console.error("Error al actualizar observacion sp nuevo:", error); // Log detallado en consola
      return this.responseService.error({
        mensaje: "Ocurrió un error al actualizar la observacion.",
        detalle: error.message || error,
      });
    }
  }


  async actualizarPlanilla(data: actualizarPlanillaDto) {
    try {
      ;
      let query =
   
    

      `SELECT   sp_modificacion_actualizar_planilla($1);  `;
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
          `SELECT  public.sp_modificacion_actualizar_planilla_item($2, $1) `;
        resultado = await this.planillaRepositorio.query(query2, params);

      } else {
        // Si no hay datos, actualizar con valores en 0
        let query3 =
          `SELECT  sp_modificacion_planilla_reset($2, $1);         
           `;
        resultado = await this.planillaRepositorio.query(query3, params);
      }

      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }



  // async finalizarPlanilla(data: FinalizarPlanillaDto) {
  //   try {
  //     let query =
  //       ` UPDATE public.planilla 
  //         SET finalizado =true WHERE id_modificacion_pago = $1 AND id_estado = 1`;
  //     const params = [data.id_modificacion_pago];
  //     await this.planillaRepositorio.query(query, params);

  //     let queryrespuesta = `SELECT finalizado, id_modificacion_pago  FROM planilla WHERE id_modificacion_pago = $1 AND id_estado = 1 `;

  //     const resultado = await this.planillaRepositorio.query(queryrespuesta, params);
  //     return this.responseService.success(resultado, "Actualizado Correctamente.")
  //   } catch (error) {
  //     return this.responseService.error(error);
  //   }
  // }

  async finalizarPlanilla(data: FinalizarPlanillaDto) {
    try {
      const params = [data.id_modificacion_pago];
  
      //Actualizar planillas
      const updateQuery = `UPDATE public.planilla 
                           SET finalizado = true 
                           WHERE id_modificacion_pago = $1 AND id_estado = 1`;
      await this.planillaRepositorio.query(updateQuery, params);
  
      //Consultar resultado del update
      const selectQuery = `SELECT finalizado, id_modificacion_pago  
                           FROM planilla 
                           WHERE id_modificacion_pago = $1 AND id_estado = 1`;
      const resultado = await this.planillaRepositorio.query(selectQuery, params);
      
  
      //Ejecutar el SP
      const spQuery = `SELECT * FROM sp_crear_informe_y_opcional_memorandum($1)`;
     // console.log('🟡 Ejecutando SP sp_crear_informe_y_opcional_memorandum...');
      const spResult = await this.planillaRepositorio.query(spQuery, [data.id_modificacion_pago]);
     // console.log('🟢 Resultado del SP:', resultado);
   
      const id_tipo =spResult[0]?.idtipoinforme ?? null;
      const id_obra =spResult[0]?.idobra ?? null;
      const id_informe =spResult[0]?.idinforme ?? null; 
      const id_solicitud =spResult[0]?.idsolicitud ?? null;           

      const datos = {
        id_tipo_documento: id_tipo,
        id_obra: id_obra,
        id_informe: id_informe,
        id_solicitud: id_solicitud
      }
   //   console.log();
      
      const encabezado = await this.informeService.crearencabezadoDocumentos(datos)
      if (!encabezado) {
        throw new Error('No se pudo crear el encabezado de documentos');
      }      

  
      return this.responseService.success(
        { planilla: resultado, 
          resultadoSP: spResult,
         mensaje: spResult[0]?.mensaje},
        spResult[0]?.mensaje ?? 'Planilla finalizada correctamente.'
      );
  
    } catch (error) {
      return this.responseService.error(error, 'Error al finalizar la planilla.');
    }
  }
  



  async listaPlanillaXItem(data: PlanillaItemDto) {
    try {
      ;
      let query =

` 
SELECT * FROM public.vista_item_planilla
WHERE 
  id_modificacion_pago = $1
  AND id_item = $2
;`;

      const params: any[] = [data.id_modificacion_pago, data.id_item];
      const resultado: any[] = await this.planillaRepositorio.query(query, params);
      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

    async listarObservacionesPlanilla(idPlanilla: number): Promise<any> {
    try {
      const query = `SELECT * FROM sp_planilla_observacion_list($1)`;
      const observaciones = await this.planillaRepositorio.query(query, [idPlanilla]);

      return this.responseService.success(
        observaciones,
        'Observaciones recuperadas correctamente.'
      );
    } catch (error) {
      return this.responseService.error(
        error,
        'Error al listar observaciones de la planilla.'
      );
    }
  }

  async listarJustificacionesPlanilla(idPlanilla: number): Promise<any> {
    try {
      const query = `SELECT * FROM sp_planilla_justificacion_list($1)`;
      const justificaciones = await this.planillaRepositorio.query(query, [idPlanilla]);

      return this.responseService.success(
        justificaciones,
        'Justificaciones recuperadas correctamente.'
      );
    } catch (error) {
      return this.responseService.error(
        error,
        'Error al listar justificaciones de la planilla.'
      );
    }
  }

}
