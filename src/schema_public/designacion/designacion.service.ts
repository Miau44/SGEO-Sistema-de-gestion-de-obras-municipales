import { Injectable } from '@nestjs/common';
import { CreateDesignacionDto } from './dto/create-designacion.dto';
import { UpdateDesignacionDto } from './dto/update-designacion.dto';
import { And, Any, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { Obra } from '../obra/entities/obra.entity';
import { Correlativo } from '../correlativo/entities/correlativo.entity';
import { log } from 'console';
import { Designacion } from './entities/designacion.entity';
import { EstadoObraDesigDto } from './dto/estado_obra_designacion.dto';
import { MaxCorrelativoDto } from './dto/correlativo.dto';
import { ReemplazoDto } from './dto/reemplazo.dto';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { PersonapermisoUe } from '../personapermiso_ue/entities/personapermiso_ue.entity';
import { GenerarDto } from './dto/generar.dto';
import { ObraService } from '../obra/obra.service';
import { SolicitudService } from '../solicitud/solicitud.service';


@Injectable()
export class DesignacionService {

  constructor(
    @InjectRepository(Designacion) private DesigRepositorio: Repository<Designacion>,
    @InjectRepository(Obra) private obraRepositorio: Repository<Obra>,
    @InjectRepository(Correlativo) private correlativoRepositorio: Repository<Correlativo>,
    @InjectRepository(Solicitud) private solicitudRepocitorio: Repository<Solicitud>,
    @InjectRepository(PersonapermisoUe) private ppueRepocitorio: Repository<PersonapermisoUe>,

    private responseService: ResponseService,
    private obraService: ObraService,
    private serviceSolicitud: SolicitudService

  ) { }

  async create(createDesignacionDto: CreateDesignacionDto) {
    try {
      //inicio 
      //si existe la obra  adiciono la solicitud de designacion 
     /* const siexiste = await this.findOneObra(createDesignacionDto.id_ficha)
      if (siexiste) {
        const data_correlativo = {
          "id_obra": createDesignacionDto.id_obra,
          "correlativo_memo": createDesignacionDto.correlativo_memo,
          "usuario_registro": createDesignacionDto.usuario_registro,
          "id_estado": 1
        };
       const v_id_correlativo_memo = await this.create_correlativo(data_correlativo) 
       createDesignacionDto.id_correlativo_memo =  v_id_correlativo_memo.id_correlativo_memo              
        const resultado = await this.DesigRepositorio.save(createDesignacionDto);                   

        return this.responseService.success(resultado, "Guardado Correctamente.")
      }
      else {
        const data_obra = {
          "id_ficha": createDesignacionDto.id_ficha,
          "id_tipo_obra": 0,
          "id_modalidad": 0,
          "id_estado_general": 1,// SOLICITADO
          "usuario_registro": createDesignacionDto.usuario_registro,
          "id_estado": 1
        };
        const v_obra = await this.create_obra(data_obra)
        createDesignacionDto.id_obra = v_obra.data.id_obra;
        let id_ficha = createDesignacionDto.id_ficha;
        const v_id_obra = await this.obraRepositorio.findOne({ where: { id_ficha } });
      if (v_id_obra?.id_obra) { createDesignacionDto.id_obra = v_id_obra.id_obra; }

      const data_correlativo = {
        "id_obra": createDesignacionDto.id_obra,
        "correlativo_memo": createDesignacionDto.correlativo_memo,
        "usuario_registro": createDesignacionDto.usuario_registro,
        "id_estado": 1
      };
      const v_id_correlativo_memo = await this.create_correlativo(data_correlativo)
      createDesignacionDto.id_correlativo_memo = v_id_correlativo_memo.id_correlativo_memo
      const resultado = await this.DesigRepositorio.save(createDesignacionDto);

      if (resultado) { await this.updateDesignacionestadoXPersona(createDesignacionDto.id_obra); }
      await this.update_obra_estado(2, v_id_correlativo_memo.id_obra);// ESTADO 2 SOLICITADO
      return this.responseService.success(resultado, "Guardado Correctamente.")
      /*  }*/

      const resultado = await  this.DesigRepositorio.save(createDesignacionDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async create_obra(createObra: any) {
    try {
      const resultado = await this.obraRepositorio.save(createObra);
      return this.responseService.success(resultado, "Guardado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all solicitudDesignacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitudDesignacion`;
  }

 async update(id_designacion: number, updateDesignacionDto: UpdateDesignacionDto) {
    try {
      const resultado = await this.DesigRepositorio.update(id_designacion, updateDesignacionDto)
      return this.responseService.success(id_designacion, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} solicitudDesignacion`;
  }

  async findOneObra(id_ficha: number): Promise<boolean> {
    
    const user = await this.obraRepositorio.findOne({ where: { id_ficha } });
    return !!user; // Devuelve true si la obra existe, de lo contrario false  
  }


  async create_correlativo(createCorrelativoDto: any) {
   /* const query = `
    SELECT COUNT(*)
    FROM correlativo_memo
    WHERE id_obra = ${createCorrelativoDto.id_obra}`;
    const result = await this.correlativoRepositorio.query(query);

    const count = parseInt(result[0].count, 10);
    let correlativo_memo = count + 1;*/
    //createCorrelativoDto.correlativo_memo = correlativo_memo;
    const v_correlativo = await this.correlativoRepositorio.save(createCorrelativoDto)
    return v_correlativo;
  }



  async update_obra_estado(id_estado_gral: number, id_obra:number) {
    try {
      const query1 = `
      UPDATE public.obra
      SET "id_estado_general" = $1
      WHERE id_obra = $2`;
      const params = [id_estado_gral, id_obra];  
      await this.obraRepositorio.query(query1, params);  
      return {
        statusCode: 200,
        message: true,
        data: "Se actualizaron datos",
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
      };
    }
  }


  async updateDesignacionestadoXPersona(id_obra: number) {
    try {
      const query1 = `
      UPDATE public.designacion
      SET id_estado = 0
      WHERE id_persona IN (-1,-2)  AND id_obra =$1`;
      const params = [id_obra];
      const resultado = await this.obraRepositorio.query(query1, params);
      return {
        statusCode: 200,
        message: true,
        data: resultado,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
      };
    }
  }

  async update_designacion_estado(id_designacion: number) {
    try {
      const query2 = `
      UPDATE  public.designacion
      SET "estado_designacion" = 99
      WHERE id_designacion =$1  `;
      const params3 = [id_designacion];
      await this.DesigRepositorio.query(query2, params3);
      return {
        statusCode: 200,
        message: true,
        data: "Se actualizaron datos",
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
      };
    }
  }


  async update_solicitud_estado(estado_designacion: number, id_solicitud: number, id_estado_general: number) {

    try {
      const query2 = `
      UPDATE  public.solicitud
      SET "id_estado_solicitud" =$1,
       "id_estado_general" =$3
      WHERE id_solicitud =$2`;
      const params3 = [estado_designacion, id_solicitud, id_estado_general];
      await this.DesigRepositorio.query(query2, params3);
      return {
        statusCode: 200,
        message: true,
        data: "Se actualizaron datos",
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
      };
    }
  }






  async aprobarDesignacion(AprobarDto: EstadoObraDesigDto) {
    try {
      for (let i = 0; i < AprobarDto.designacion.length; i++) {    // Actualizar estado de designación y solicitud
        const actualizarEstado = async () => {
          const datadesignacion = { "estado_designacion": 99, "correlativo" : AprobarDto.designacion[i].correlativo}
          const estado_designacion = await this.update(AprobarDto.designacion[i].id_designacion, datadesignacion)

          const datasolicitud = { "id_estado_solicitud": 4, "id_estado_general": AprobarDto.id_estado_flujo }
          await this.serviceSolicitud.update(AprobarDto.id_solicitud, datasolicitud)
        }
        const respuesta_obra = await this.obraService.findOne(AprobarDto.id_obra)
        const desc_cod_ue = respuesta_obra.data[0].desc_cod_ue;

        const respuestagenera: any = await this.generarSoloSolicitud(AprobarDto.id_obra)

        if (respuestagenera) {
          const usuarioDestinoQuery = `
        SELECT idusuario FROM public.sp_permisos_xpersona_filas() WHERE idpermiso IN (85,86)
        AND desccodue = ${desc_cod_ue}`;
          const params4 = [desc_cod_ue];
          const usuarioDestinoResult = await this.DesigRepositorio.query(usuarioDestinoQuery);
          if (!usuarioDestinoResult || usuarioDestinoResult.length === 0) {

            return {
              statusCode: 500,
              message: false,
              error: "Error: No se encontró un usuario destino válido.",
            };
          }
          await actualizarEstado();
          const usuario = usuarioDestinoResult[0].idusuario;
          const data_solicitud = {
            id_tipo_solicitud: 114,
            id_estado_solicitud: 2,
            id_obra: AprobarDto.id_obra,
            id_estado_general: 12,
            id_usuario: usuario,
            proveido: "SOLICITUD GENERADA POR SISTEMA",
            usuario_registro: 0,
            id_estado_registro: 1,
          };

          const resultado = await this.solicitudRepocitorio.save(data_solicitud);
        }
        else {
          await actualizarEstado()
        };
      }
      return this.responseService.success("Solicitud generada correctamente.");
    } catch (error) {
      console.error("Error en aprobarDesignacion:", error);
      return this.responseService.error(error);
    }
  }  

  async deleteDesignacionestadoXPersona(id_obra: number) {
    try {
      const query1 = `
      DELETE FROM  public.designacion      
      WHERE id_persona IN (-1,-2)  AND id_obra =$1`;
      const params = [id_obra];
      const resultado = await this.obraRepositorio.query(query1, params);
      return {
        statusCode: 200,
        message: true,
        data: resultado,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
      };
    }
  }

  async rechazarDesignacion(id_designacion: number, id_obra:number) {
    try {
      const query1 = `
      DELETE FROM public.designacion   
      WHERE id_designacion = $1`;
      const params = [id_designacion];
      const resultado = await this.DesigRepositorio.query(query1, params);

      /*const query2 = `
        DELETE FROM correlativo_memo  cm
      WHERE id_correlativo_memo IN(
      SELECT cm.id_correlativo_memo FROM correlativo_memo AS cm
      INNER JOIN designacion AS d ON cm.id_correlativo_memo = d.id_correlativo_memo WHERE d.id_designacion = $1) `;
      const params2 = [id_designacion];
      const resultado = await this.DesigRepositorio.query(query2, params2);

      const query3 = `
      UPDATE  obra  as o
      SET id_estado_general =1
      WHERE o.id_obra IN(
      SELECT o.id_obra FROM obra AS o
      INNER JOIN designacion AS d ON o.id_obra = d.id_obra WHERE d.id_designacion = $1) `;
      const params3 = [id_designacion];
      await this.DesigRepositorio.query(query3, params3);
      */
      await this.deleteDesignacionestadoXPersona(id_obra);

      return this.responseService.success(resultado, "Guardado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }





  async maxCorrelativo(correlativoDto: MaxCorrelativoDto) {
    try {
   /*   const query1 = `
    SELECT COALESCE(MAX(correlativo_memo),0) AS max_correlativo FROM designacion AS d
    INNER JOIN public.persona AS p ON d.id_persona = p.id_persona
    INNER JOIN correlativo_memo AS  cm ON d.id_correlativo_memo= cm.id_correlativo_memo
    INNER JOIN LATERAL (SELECT * FROM public.sp_descripcion_permiso(p.id_persona)) AS dp ON p.id_persona = dp.idpersona		
    WHERE d.id_obra = $1 AND dp.idpermisod IN($2 ) `;*/

   const query1 = `
    SELECT COALESCE(MAX(correlativo_memo),0) AS max_correlativo FROM designacion AS d
    INNER JOIN public.persona AS p ON d.id_persona = p.id_persona
    INNER JOIN correlativo_memo AS  cm ON d.id_correlativo_memo= cm.id_correlativo_memo
    INNER JOIN LATERAL ( SELECT * FROM public.sp_permisos_xpersona_filas()) AS dp ON p.id_persona = dp.idpersona		
    WHERE d.id_obra = $1 AND dp.idpermiso IN($2  )`;
      const params = [correlativoDto.id_obra, correlativoDto.id_permiso];
      const resultado = await this.DesigRepositorio.query(query1, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

async actualizarReemplazar(id_designacion: number, reemplazoDto:ReemplazoDto) {
  try {

    const resultado = await this.DesigRepositorio.update(id_designacion, reemplazoDto)
    if(resultado)
  return this.responseService.success(resultado, "Guardado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async generarSolicitud(data: GenerarDto) {
    try {
      const existeDesignacionesQuery = `
          SELECT id_obra FROM solicitud WHERE id_obra = ${data.idobra} AND id_estado_general IN (10,11) 
          GROUP BY id_obra HAVING COUNT(DISTINCT id_estado_general) = 2`;
      const params3 = [data.idobra];
      const existeDesignacionesResult = await this.DesigRepositorio.query(existeDesignacionesQuery);

      if (!existeDesignacionesResult || existeDesignacionesResult.length === 0) {
        return {
          statusCode: 500,
          message: false,
          error: "Error: No se encontraron designaciones para el criterio dado.Ocurrió un error en el servidor",
        };
      }

      const usuarioDestinoQuery = `
          SELECT idusuario FROM public.sp_permisos_xpersona_filas() WHERE idpermiso IN (85,86)
          AND desccodue = ${data.desccodue}`;
      const params4 = [data.desccodue];
      const usuarioDestinoResult = await this.DesigRepositorio.query(usuarioDestinoQuery);

      if (!usuarioDestinoResult || usuarioDestinoResult.length === 0) {

        return {
          statusCode: 500,
          message: false,
          error: "Error: No se encontró un usuario destino válido.",
        };
      }
      const usuario = usuarioDestinoResult[0].idusuario;
      const data_solicitud = {
        id_tipo_solicitud: 114,
        id_estado_solicitud: 2,
        id_obra: data.idobra,
        id_estado_general: 12,
        id_usuario: usuario,
        proveido: "SOLICITUD GENERADA POR SISTEMA",
        usuario_registro: 0,
        id_estado_registro: 1,
      };

      const resultado = await this.solicitudRepocitorio.save(data_solicitud);

      return this.responseService.success(resultado, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async generarSoloSolicitud(id_obra: number) {
    try {
      const query = `
        SELECT id_obra 
        FROM solicitud 
        WHERE id_obra = $1 
        AND id_estado_general IN (10, 11) 
        GROUP BY id_obra 
        HAVING COUNT(DISTINCT id_estado_general) = 2`;
        
      const result = await this.DesigRepositorio.query(query, [id_obra]);
  
      return result.length > 0;
      
    } catch (error) {
      console.error('Error en generar:', error);
      return false;
    }
  }

}
