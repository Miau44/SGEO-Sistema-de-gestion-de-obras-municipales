import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDesignacionDto } from './dto/create-designacion.dto';
import { UpdateDesignacionDto } from './dto/update-designacion.dto';
import { And, Any, Connection, DataSource, In, Not, Repository } from 'typeorm';
import { InjectConnection, InjectDataSource, InjectRepository } from '@nestjs/typeorm';
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
import { Persona } from '../persona/entities/persona.entity';
import { SolicitudHistorial } from '../solicitud/entities/solicitud_historial.entity';
import { LogService } from '../log/log.service';
import { TraspasoPendientesDto } from './dto/traspaso_pendientes.dto';


@Injectable()
export class DesignacionService {

  constructor(
    @InjectRepository(Designacion) private readonly DesigRepositorio: Repository<Designacion>,
    @InjectRepository(Obra) private obraRepositorio: Repository<Obra>,
    @InjectRepository(Correlativo) private correlativoRepositorio: Repository<Correlativo>,
    @InjectRepository(Solicitud) private solicitudRepocitorio: Repository<Solicitud>,
    @InjectRepository(PersonapermisoUe) private ppueRepocitorio: Repository<PersonapermisoUe>,
      @InjectRepository(SolicitudHistorial) private solicitudHisRepositorio: Repository<SolicitudHistorial>,  

    private responseService: ResponseService,
    private obraService: ObraService,
    private serviceSolicitud: SolicitudService,
    private logService:LogService,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectConnection() private readonly connection: Connection,
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



  async date() {
    return (await this.DesigRepositorio.query('select now()'))[0].now;
  }



//paola
    async aprobarDesignacion(AprobarDto: EstadoObraDesigDto) {
      try {
        // Verificar si se debe generar una nueva solicitud (solo si el flujo es 11)
        let debeGenerarSolicitud = false;
        if (AprobarDto.id_estado_flujo === 11) {
          debeGenerarSolicitud = await this.generarSoloSolicitud(AprobarDto.id_obra);
        }    
        const respuesta_obra = await this.obraService.findOne(AprobarDto.id_obra);
        const desc_cod_ue = respuesta_obra.data[0].desc_cod_ue;
        const gestion = respuesta_obra.data[0].gestion;
    
        for (let i = 0; i < AprobarDto.designacion.length; i++) {
          const actualizarEstado = async () => {
            const datadesignacion = {
              estado_designacion: 99,
              correlativo: AprobarDto.designacion[i].correlativo,
              fecha_aprobacion: await this.date()
            };
            await this.update(AprobarDto.designacion[i].id_designacion, datadesignacion);
    
            const datasolicitud = {
              id_estado_solicitud: 4,
              id_estado_general: AprobarDto.id_estado_flujo,
              usuario_registro : AprobarDto.id_usuario
            };
            await this.serviceSolicitud.update(AprobarDto.id_solicitud, datasolicitud);
          };
    
          if (debeGenerarSolicitud) {
            const usuarioDestinoQuery = `
              SELECT idusuario FROM public.sp_permisos_xpersona_filas() 
              WHERE idpermiso IN (85,86)
                AND desccodue = ${desc_cod_ue} 
                AND gestion = ${gestion}`;
    
            const usuarioDestinoResult = await this.DesigRepositorio.query(usuarioDestinoQuery);
    
            if (!usuarioDestinoResult || usuarioDestinoResult.length === 0) {
              await this.registrarLog('aprobarDesignacion', 'No se encontró usuario destino', AprobarDto, 'Sin resultado', 0);
              return {
                statusCode: 500,
                message: false,
                error: "Error: No se encontró un usuario destino válido.",
              };
            }
    
            await actualizarEstado(); // Se actualiza primero
    
            const usuario = usuarioDestinoResult[0].idusuario;
            const data_solicitud = {
              id_tipo_solicitud: 114,
              id_estado_solicitud: 2,
              id_obra: AprobarDto.id_obra,
              id_estado_general: 12,
              id_usuario: usuario,
              proveido: "SOLICITUD GENERADA POR SISTEMA",
              usuario_registro: usuario,
              id_estado_registro: 1,
            };
            const  respuesta_etapa =   await this.solicitudRepocitorio.save(data_solicitud);

            //para general historial
            if (!respuesta_etapa) {

              await this.registrarLog('aprobarDesignacion', 'Error al guardar la solicitud', data_solicitud, 'null', usuario);
              return this.responseService.error("Error al guardar la solicitud.");
            }
            await this.registrarLog('aprobarDesignacion', 'Solicitud creada correctamente', data_solicitud, respuesta_etapa, usuario);
            const datosHistorialetapa = {
              id_solicitud: respuesta_etapa.id_solicitud,
              id_tipo_solicitud: respuesta_etapa.id_tipo_solicitud,
              nro_solicitud: respuesta_etapa.nro_solicitud,
              id_estado_solicitud: respuesta_etapa.id_estado_solicitud,
              id_obra: respuesta_etapa.id_obra,
              id_estado_general: respuesta_etapa.id_estado_general,
              id_usuario: respuesta_etapa.id_usuario,
              proveido: respuesta_etapa.proveido,
              data_solicitud: respuesta_etapa.data_solicitud,
              fecha_envio: respuesta_etapa.fecha_envio,
              id_usuario_previo: respuesta_etapa.id_usuario_previo,
              usuario_registro: respuesta_etapa.usuario_registro,
              id_estado_registro: respuesta_etapa.id_estado_registro,
            };
      
            const solicitud_historial = await this.solicitudHisRepositorio.save(datosHistorialetapa)
            await this.registrarLog('aprobarDesignacion', 'Historial creado', datosHistorialetapa, solicitud_historial, usuario);
            debeGenerarSolicitud = false; // prevenir que genere más de una en caso de múltiples designaciones
          } else {
            await actualizarEstado(); // Solo se actualiza si no se genera nueva solicitud
          }
        }
    
        // Historial de solicitud
        const respuesta_solicitud = await this.serviceSolicitud.findOne(AprobarDto.id_solicitud);
        const datosHistorial = {
          id_solicitud: respuesta_solicitud.data.id_solicitud,
          id_tipo_solicitud: respuesta_solicitud.data.id_tipo_solicitud,
          nro_solicitud: respuesta_solicitud.data.nro_solicitud,
          id_estado_solicitud: respuesta_solicitud.data.id_estado_solicitud,
          id_obra: respuesta_solicitud.data.id_obra,
          id_estado_general: respuesta_solicitud.data.id_estado_general,
          id_usuario: respuesta_solicitud.data.id_usuario,
          proveido: 'APROBACIÓN DE DESIGNACIÓN',
          data_solicitud: respuesta_solicitud.data.data_solicitud,
          fecha_envio: respuesta_solicitud.data.fecha_envio,
          id_usuario_previo: respuesta_solicitud.data.id_usuario_previo,
          usuario_registro: respuesta_solicitud.data.usuario_registro,
          id_estado_registro: respuesta_solicitud.data.id_estado_registro,
        };    
        await this.serviceSolicitud.createHistorial(datosHistorial);
         await this.registrarLog('Aprobar Designacion', 'Aprobacion de Designacion creada correctamente ', datosHistorial, 'OK', 0);
    
        return this.responseService.success("Solicitud generada correctamente.");
      } catch (error) {
        console.error("Error en aprobarDesignacion:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        await this.registrarLog('aprobarDesignacion', 'Error inesperado', AprobarDto, errorMessage, 0);
        return this.responseService.error(error);
      }
    }    

    


  async aprobarDesignacionR(AprobarDto: EstadoObraDesigDto) {
    try {
      for (let i = 0; i < AprobarDto.designacion.length; i++) {    // Actualizar estado de designación y solicitud
        const actualizarEstado = async () => {
          const datadesignacion = { "estado_designacion": 102, "correlativo" : AprobarDto.designacion[i].correlativo}
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
            await this.registrarLog('aprobarDesignacionR', 'No se encontró usuario destino', AprobarDto, 'Sin resultado', 0);
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
          await this.registrarLog('aprobarDesignacionR', 'Solicitud creada', data_solicitud, resultado, usuario);
        }
        else {
          await actualizarEstado()
        };
      }
      await this.registrarLog('aprobarDesignacionR', 'Solicitud(es) procesada(s)', AprobarDto, 'OK', 0);
      return this.responseService.success("Solicitud generada correctamente.");
    } catch (error) {
      console.error("Error en aprobarDesignacion:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.registrarLog('aprobarDesignacionR', 'Error inesperado', AprobarDto, errorMessage, 0);
      return this.responseService.error(error);
    }
  }  

async aprobarReemplazoDesignacion(AprobarDto: EstadoObraDesigDto) {
  try {
    console.log("[1] Iniciando aprobarDesignacionR()");
    console.log("Datos recibidos AprobarDto:", JSON.stringify(AprobarDto, null, 2));

    for (let i = 0; i < AprobarDto.designacion.length; i++) {
      console.log(`\n [2] Iteración ${i + 1} de ${AprobarDto.designacion.length}`);
      console.log(" Designación actual:", AprobarDto.designacion[i]);

      // --- FUNCIÓN INTERNA PARA ACTUALIZAR ESTADO ---
      const actualizarEstado = async () => {
        console.log("[3] Entrando en actualizarEstado()");

        const datadesignacion = {
          estado_designacion: 102,
          correlativo: AprobarDto.designacion[i].correlativo,
          fecha_aprobacion: await this.date(),
        };
        console.log("Datos para actualizar designación:", datadesignacion);

        const estado_designacion = await this.update(AprobarDto.designacion[i].id_designacion, datadesignacion);
        console.log("Resultado actualización designación:", estado_designacion);

        const datasolicitud = {
          id_estado_solicitud: 4,
          id_estado_general: AprobarDto.id_estado_flujo,
          usuario_registro: AprobarDto.id_usuario,
        };
        console.log("Datos para actualizar solicitud:", datasolicitud);

        await this.serviceSolicitud.update(AprobarDto.id_solicitud, datasolicitud);
        console.log("Solicitud actualizada correctamente.");
      };

        await actualizarEstado();
    }

    // --- HISTORIAL ---
    console.log("\n[4] Creando historial de solicitud...");
    const respuesta_solicitud = await this.serviceSolicitud.findOne(AprobarDto.id_solicitud);
    console.log("Solicitud encontrada:", respuesta_solicitud);

    const datosHistorial = {
      id_solicitud: respuesta_solicitud.data.id_solicitud,
      id_tipo_solicitud: respuesta_solicitud.data.id_tipo_solicitud,
      nro_solicitud: respuesta_solicitud.data.nro_solicitud,
      id_estado_solicitud: respuesta_solicitud.data.id_estado_solicitud,
      id_obra: respuesta_solicitud.data.id_obra,
      id_estado_general: respuesta_solicitud.data.id_estado_general,
      id_usuario: respuesta_solicitud.data.id_usuario,
      proveido: 'APROBACIÓN POR REEMPLAZO',
      data_solicitud: respuesta_solicitud.data.data_solicitud,
      fecha_envio: respuesta_solicitud.data.fecha_envio,
      id_usuario_previo: respuesta_solicitud.data.id_usuario_previo,
      usuario_registro: respuesta_solicitud.data.usuario_registro,
      id_estado_registro: respuesta_solicitud.data.id_estado_registro,
    };
    console.log("Datos historial:", datosHistorial);

    await this.serviceSolicitud.createHistorial(datosHistorial);
    console.log("Historial creado correctamente.");

    await this.registrarLog('Aprobar Designacion', 'Aprobacion de Designacion creada correctamente ', datosHistorial, 'OK', 0);

    console.log("[5] Finalizando proceso aprobarDesignacionR — todo OK");
    await this.registrarLog('aprobarDesignacionR', 'Solicitud(es) procesada(s)', AprobarDto, 'OK', 0);

    return this.responseService.success("Solicitud generada correctamente.");
  } catch (error) {
    console.error("[ERROR] En aprobarDesignacionR:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    await this.registrarLog('aprobarDesignacionR', 'Error inesperado', AprobarDto, errorMessage, 0);
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

    /*  const query1 = `
    SELECT COALESCE(MAX(correlativo_memo),0) AS max_correlativo FROM designacion AS d
    INNER JOIN public.persona AS p ON d.id_persona = p.id_persona
    INNER JOIN correlativo_memo AS  cm ON d.id_correlativo_memo= cm.id_correlativo_memo
    INNER JOIN LATERAL ( SELECT * FROM public.sp_permisos_xpersona_filas()) AS dp ON p.id_persona = dp.idpersona		
    WHERE d.id_obra = $1 AND dp.idpermiso IN($2  )`;*/



    const query1 = `
    SELECT COALESCE(MAX(correlativo),0) AS max_correlativo FROM designacion AS d
    INNER JOIN public.persona AS p ON d.id_persona = p.id_persona
    INNER JOIN LATERAL ( SELECT * FROM public.sp_permisos_xpersona_filas()) AS dp ON p.id_persona = dp.idpersona		
    WHERE d.id_obra = $1 AND dp.idpermiso IN($2  )`;
      const params = [correlativoDto.id_obra, correlativoDto.id_permiso];
      const resultado = await this.DesigRepositorio.query(query1, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

    async maxCorrelativoSolicitud(correlativoDto: {id_obra:number, id_permiso: number, id_cite_solicitud: number}) {
    try {
    const query1 = `
    SELECT COALESCE(MAX(d.correlativo_solicitud), 0) AS max_correlativo_solicitud FROM designacion AS d
	    INNER JOIN public.persona AS p ON d.id_persona = p.id_persona
	    INNER JOIN LATERAL (SELECT * FROM public.sp_permisos_xpersona_filas()) AS dp ON p.id_persona = dp.idpersona
	  WHERE d.id_obra = $1 AND dp.idpermiso IN ($2) AND d.id_cite_solicitud = $3;`;
      const params = [correlativoDto.id_obra, correlativoDto.id_permiso, correlativoDto.id_cite_solicitud];
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


    async generarSoloSolicitud(id_obra: number): Promise<boolean> {
      try {
        const query = `
          SELECT 1
          FROM solicitud
          WHERE id_obra = $1 
            AND id_estado_general = 11
          LIMIT 1;
        `;
        const result = await this.DesigRepositorio.query(query, [id_obra]);
    
        // Si NO hay resultados, entonces se puede generar (no existe ninguna con estado 11)
        return result.length === 0;
      } catch (error) {
        console.error('Error en generarSoloSolicitud:', error);
        return false;
      }
    }



  //mike
  async reemplazarDesignacion(idDesignacionNueva: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // 1. Buscar el id_designacion original
      const designacionOriginal = await queryRunner.manager.findOne(Designacion, {
        where: { id_designacion: idDesignacionNueva }
      });
  
      if (!designacionOriginal) {
        throw new NotFoundException('No se encontró la designación a reemplazar');
      }
  
      // 2. Actualizar estado_designacion y fecha_reemplazo
      await queryRunner.manager.update(Designacion, designacionOriginal.id_designacion, {
        estado_designacion: 275,
        //fecha_reemplazo: new Date(),
      });
  
      // 3. Obtener datos de la persona relacionada
      const persona = await queryRunner.manager.findOne(Persona, {
        where: { id_persona: designacionOriginal.id_persona }
      });
  
      await queryRunner.commitTransaction();
      
      return {
        mensaje: 'Reemplazo realizado con éxito',
        designacionReemplazada: designacionOriginal,
        persona: persona
      };
  
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error al reemplazar la designación');
    } finally {
      await queryRunner.release();
    }
  }

  
  async rechazarSolicitudes2(estado_designacion: number, id_tipo_solicitud: number) {
    try {
      await this.dataSource.query(
        `SELECT rechazar_solicitudes2($1, $2)`, 
        [estado_designacion, id_tipo_solicitud]
      );
  
      return {
        statusCode: 200,
        message: 'Solicitudes rechazadas correctamente.',
      };
    } catch (error) {
      // Convertimos error a tipo "Error" para acceder a message
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  
      console.error('Error en rechazarSolicitudes:', errorMessage);
      return {
        statusCode: 500,
        message: 'Error al rechazar solicitudes.',
        error: errorMessage,
      };
    }
  }
  

  //para obtener el id_solictud
  async getSolicitudByDesignacion(id_designacion: number): Promise<number | null> {
    const designacion = await this.DesigRepositorio.findOne({
      where: { id_designacion },
      select: ['id_solicitud'], // Solo traemos id_solicitud
    });
  
    return designacion ? designacion.id_solicitud : null;
  }

  async buscarIdSolicitud(id_designacion: number): Promise<number | null> {
    const designacion = await this.DesigRepositorio.findOne({
      where: { id_designacion },
    });

    return designacion ? designacion.id_solicitud : null;
  }


  async obtenerDesignacionesPendientes(): Promise<Designacion[]> {
    try {
      const designaciones = await this.DesigRepositorio.find({
        where: { id_estado: 0, estado_designacion: 105 }, // Filtramos por id_estado = 0
      });
  
     // console.log('📌 Designaciones encontradas:', designaciones); // 👀 Verificar en consola del backend
      return designaciones;
    } catch (error) {
      console.error('❌ Error al obtener las designaciones:', error);
      throw new InternalServerErrorException('Error al obtener las designaciones pendientes');
    }
  }


  async actualizarEstadoSolicitudesSupervisores(): Promise<{ mensaje: string; actualizados: number }> {
    try {
      // 🔎 Buscar registros en la tabla solicitud con las condiciones dadas
      const solicitudes = await this.solicitudRepocitorio.find({
        where: { id_tipo_solicitud: 76, id_estado_solicitud: 2, id_estado_general:10 },
        select: ['id_solicitud'],
      });
  
      if (!solicitudes.length) {
        return { mensaje: 'No se encontraron solicitudes para actualizar', actualizados: 0 };
      }
  
      // Extraer los id_solicitud encontrados
      const idSolicitudes = solicitudes.map(s => s.id_solicitud);
  
      // 📝 Actualizar los registros en la tabla "solicitud"
      const resultado = await this.solicitudRepocitorio
        .createQueryBuilder()
        .update(Solicitud)
        .set({ id_estado_solicitud: 4 })
        .where('id_solicitud IN (:...ids)', { ids: idSolicitudes })
        .execute();
  
      const actualizados = resultado.affected || 0;
      return {
        mensaje: actualizados > 0 ? 'Solicitudes actualizadas con éxito' : 'No se encontraron solicitudes para actualizar',
        actualizados,
      };
    } catch (error) {
      console.error('❌ Error al actualizar solicitudes:', error);
      throw new InternalServerErrorException('Error al actualizar solicitudes');
    }
  }
  
  
  async actualizarEstadoSolicitudesFiscales(): Promise<{ mensaje: string; actualizados: number }> {
    try {
      // 🔎 Buscar registros en la tabla solicitud con las condiciones dadas
      const solicitudes = await this.solicitudRepocitorio.find({
        where: { id_tipo_solicitud: 76, id_estado_solicitud: 2, id_estado_general:11 },
        select: ['id_solicitud'],
      });
  
      if (!solicitudes.length) {
        return { mensaje: 'No se encontraron solicitudes para actualizar', actualizados: 0 };
      }
  
      // Extraer los id_solicitud encontrados
      const idSolicitudes = solicitudes.map(s => s.id_solicitud);
  
      // 📝 Actualizar los registros en la tabla "solicitud"
      const resultado = await this.solicitudRepocitorio
        .createQueryBuilder()
        .update(Solicitud)
        .set({ id_estado_solicitud: 4 })
        .where('id_solicitud IN (:...ids)', { ids: idSolicitudes })
        .execute();
  
      const actualizados = resultado.affected || 0;
      return {
        mensaje: actualizados > 0 ? 'Solicitudes actualizadas con éxito' : 'No se encontraron solicitudes para actualizar',
        actualizados,
      };
    } catch (error) {
      console.error('❌ Error al actualizar solicitudes:', error);
      throw new InternalServerErrorException('Error al actualizar solicitudes');
    }
  }

  private async registrarLog(funcionalidad: string, mensaje: string, param: any, resp: any, user = 0) {
  await this.logService.create({
    id_usuario: user,
    funcionalidad,
    mensaje,
    parametro: JSON.stringify(param),
    respuesta: typeof resp === 'string' ? resp : JSON.stringify(resp)
  });
}


  // Servicio para traspaso de la bandeja de pendientes 
  async traspasarBandejaPorUsuarios(dto: TraspasoPendientesDto) {
    const { gestion, usuarioOrigen, usuarioNuevo, estado, simular = false, id_obra } = dto;

    if (usuarioOrigen === usuarioNuevo) {
      throw new BadRequestException('El usuario destino no puede ser igual al origen.');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // --- 1) Conteo: arma WHERE base y agrega obra si viene ---
      let whereBase = `
      s.id_usuario = $1
      AND s.id_estado_solicitud = ANY($2)
      AND s.id_estado_registro = 1
      AND f.gestion_carpeta = $3
    `;
      const countParams: any[] = [usuarioOrigen, estado, gestion];

      if (id_obra != null) {
        whereBase += ` AND s.id_obra = $${countParams.length + 1}`;
        countParams.push(id_obra);
      }

      const countRows = await qr.query(
        `
      SELECT COUNT(*)::int AS total
      FROM solicitud s
      JOIN obra  o ON s.id_obra  = o.id_obra
      JOIN ficha f ON o.id_ficha = f.id_ficha
      WHERE ${whereBase}
      `,
        countParams,
      );
      const totalElegibles = countRows?.[0]?.total ?? 0;

      // --- 2) Si es simulación o no hay nada, se devuelve y se revierte la Tx ---
      // if (simular || totalElegibles === 0) {
      //   await qr.rollbackTransaction();
      //   return this.responseService.success(
      //     {
      //       simulado: true,
      //       totalElegibles,
      //       usuarioOrigen,
      //       usuarioNuevo,
      //       id_obra: id_obra ?? null,
      //       alcance: id_obra ? 'solo_obra' : 'todas_las_obras',
      //     },
      //     totalElegibles === 0
      //       ? (id_obra
      //         ? 'No hay pendientes para esa obra con los criterios dados'
      //         : 'No hay pendientes para traspasar con los criterios dados')
      //       : 'Simulación: no se realizaron cambios',
      //   );
      // }

      // --- 3) Update con mismo WHERE dinámico (pero cambiando params) ---
      let whereUpdate = `
      s.id_usuario = $2
      AND s.id_estado_solicitud = ANY($3)
      AND s.id_estado_registro = 1
      AND f.gestion_carpeta = $4
    `;
      const updateParams: any[] = [usuarioNuevo, usuarioOrigen, estado, gestion];

      if (id_obra != null) {
        whereUpdate += ` AND s.id_obra = $${updateParams.length + 1}`;
        updateParams.push(id_obra);
      }

      const movedRows = await qr.query(
      `
      WITH movidos AS (
        UPDATE solicitud s
          SET id_usuario = $1,
              fecha_modificacion = NOW()
        FROM obra o
        JOIN ficha f ON o.id_ficha = f.id_ficha
        WHERE s.id_obra = o.id_obra
          AND ${whereUpdate}      -- el WHERE dinámico que ya armaste
        RETURNING s.id_solicitud
      )
      SELECT COUNT(*)::int AS total_movidos,
            COALESCE(json_agg(id_solicitud), '[]'::json) AS ids_movidos
      FROM movidos;
      `,
      updateParams,
      );
      const row = movedRows?.[0] ?? {};
      const totalMovidos = row.total_movidos ?? 0;
      const idsMovidos = row.ids_movidos ?? [];

      await qr.commitTransaction();
      return this.responseService.success(
        {
          simulado: false,
          totalMovidos,
          idsMovidos,    
          usuarioOrigen,
          usuarioNuevo,
          id_obra: id_obra ?? null,
          alcance: id_obra ? 'solo_obra' : 'todas_las_obras',
        },
        'Traspaso realizado correctamente',
      );
    } catch (e) {
      await qr.rollbackTransaction();
      throw new InternalServerErrorException('Error al traspasar la bandeja');
    } finally {
      await qr.release();
    }
  }

    async resumenPendientes(dto: TraspasoPendientesDto) {
    const { gestion, usuarioOrigen, id_obra, estado } = dto;

    if (!gestion || !usuarioOrigen) {
      throw new BadRequestException('Debe enviar la gestión y el usuario de origen');
    }

    const estados = estado?.length ? estado : [2, 5]; // valores por defecto

    // Total de pendientes del usuario (por obra si se manda)
    const queryBase = `
      SELECT COUNT(*)::int AS total
      FROM solicitud s
      JOIN obra o  ON s.id_obra = o.id_obra
      JOIN ficha f ON o.id_ficha = f.id_ficha
      WHERE s.id_usuario = $1
        AND f.gestion_carpeta = $2
        AND s.id_estado_registro = 1
        AND s.id_estado_solicitud = ANY($3)
        ${id_obra ? 'AND s.id_obra = $4' : ''}
    `;
    const valuesBase = id_obra ? [usuarioOrigen, gestion, estados , id_obra] : [usuarioOrigen, gestion, estados];
    const totalPend = await this.dataSource.query(queryBase, valuesBase);
    const totalPendientes = totalPend?.[0]?.total ?? 0;

    // Total filtrando por estados (los que se pueden mover)
    const queryMover = `
      SELECT COUNT(*)::int AS total
      FROM solicitud s
      JOIN obra o  ON s.id_obra = o.id_obra
      JOIN ficha f ON o.id_ficha = f.id_ficha
      WHERE s.id_usuario = $1
        AND f.gestion_carpeta = $2
        AND s.id_estado_registro = 1
        AND s.id_estado_solicitud = ANY($3)
        ${id_obra ? 'AND s.id_obra = $4' : ''}
    `;
    const valuesMover = id_obra
      ? [usuarioOrigen, gestion, estados, id_obra]
      : [usuarioOrigen, gestion, estados];
    const totalMover = await this.dataSource.query(queryMover, valuesMover);
    const totalAMover = totalMover?.[0]?.total ?? 0;

    //Mensaje dinámico claro
    const msg =
      totalPendientes === 0
        ? `El usuario ${usuarioOrigen} no tiene pendientes registrados en la gestión ${gestion}${id_obra ? ` para la obra ${id_obra}` : ''}.`
        : `El usuario ${usuarioOrigen} tiene ${totalPendientes} pendientes en la gestión ${gestion}${id_obra ? ` (obra ${id_obra})` : ''}, de los cuales ${totalAMover} podrían ser traspasados (estados ${estados.join(', ')}).`;

    //Respuesta final
    return this.responseService.success(
      {
        gestion,
        id_obra: id_obra ?? null,
        usuarioOrigen,
        estados,
        totalPendientes,
        totalAMover,
      },
      msg,
    );
  }

  
}
