import { Injectable, Param } from '@nestjs/common';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { Solicitud } from './entities/solicitud.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { And, Any, Not, Repository } from 'typeorm';
import { BandejaDto } from './dto/bandeja.dtos';
import { GenerarSolicitudDto } from './dto/generar-solicitud.dto';
import { EtapaSolicitudDto } from './dto/etapa-solicitud.dto';
import { UsuarioSolicitudDto } from './dto/usuario-solicitud.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UsuarioSolicitudObraDto } from './dto/usuario-asignado-obra.dto';
import { SolicitudHistorial } from './entities/solicitud_historial.entity';
import { CreateSolicitudHistorialDto } from './dto/create-solicitud-historial.dto';
import { UpdateSolicitudHistorialDto } from './dto/update-solicitud-historial.dto';
import { HistorialObraDto } from './dto/historial-obra.dto';
import { HistorialSolicitudDto } from './dto/historial-solicitud.dto';
import { ContadorGestionDto } from './dto/contador-gestion.dto';
import { UsuarioSolicitudXObraDto } from './dto/usuario-solicitud-obra.dto';
import { ActualizarSolicitudDto } from './dto/datos-modificacion.dto';




@Injectable()
export class SolicitudService {


  constructor(@InjectRepository(Solicitud) private solicitudRepositorio: Repository<Solicitud>,
  @InjectRepository(SolicitudHistorial) private solicitudHisRepositorio: Repository<SolicitudHistorial>,    
  private responseService: ResponseService,
  @InjectDataSource() private readonly dataSource: DataSource
) { }

async  create(createSolicitudDto: CreateSolicitudDto) {
    try {
      const respuesta_solicitud = await this.solicitudRepositorio.save(createSolicitudDto);
      if (!respuesta_solicitud) {
        return this.responseService.error("Error al guardar la solicitud.");
      }

      const datosHistorial = {
        id_solicitud: respuesta_solicitud.id_solicitud,
        id_tipo_solicitud: respuesta_solicitud.id_tipo_solicitud,
        nro_solicitud: respuesta_solicitud.nro_solicitud,
        id_estado_solicitud: respuesta_solicitud.id_estado_solicitud,
        id_obra: respuesta_solicitud.id_obra,
        id_estado_general: respuesta_solicitud.id_estado_general,
        id_usuario: respuesta_solicitud.id_usuario,
        proveido: respuesta_solicitud.proveido,
        data_solicitud: respuesta_solicitud.data_solicitud,
        fecha_envio: respuesta_solicitud.fecha_envio,
        id_usuario_previo: respuesta_solicitud.id_usuario_previo,
        usuario_registro: respuesta_solicitud.usuario_registro,
        id_estado_registro: respuesta_solicitud.id_estado_registro,
      };

      const solicitud_historial = await this.solicitudHisRepositorio.save(datosHistorial)
      return this.responseService.success(respuesta_solicitud, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all solicitud`;
  }

 async findOne(id_solicitud: number) {
    try {
      const resultado =  await this.solicitudRepositorio.findOneBy({ id_solicitud });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }      


  }

 async update(id: number, updateSolicitudDto: UpdateSolicitudDto) {
    try {
      const resultado = await this.solicitudRepositorio.update(id, updateSolicitudDto)
      return this.responseService.success(id, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} solicitud`;
  }




  async listarMiBandeja(bandeja: BandejaDto) {
    try {
    /*  const query = `
SELECT s.id_solicitud, o.id_obra, f.id_ficha,   f.cod_carpeta,  f.desc_cod_ue, f.desc_carpeta, 
eo.gestion, eg.id_estado_general, 
--ts.desc_subtipo  || ' ' ||  eg.desc_estado_gral  AS actividad, 
COALESCE(NULLIF(ts.desc_subtipo, ''), '') || ' ' || eg.desc_estado_gral AS actividad,
eg.desc_modulo,   s.id_estado_solicitud,
s.fecha_registro as fecha, eg.url_formulario, ts.desc_subtipo,
s.proveido, s.fecha_envio
FROM obra AS o   
INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion FROM public.estructura_organizacional
WHERE  gestion =$1 GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue AND f.gestion_carpeta = eo.gestion
INNER JOIN solicitud AS s ON o.id_obra = s.id_obra
INNER JOIN estado_solicitud  AS es ON  s.id_estado_solicitud = es.id_estado_solicitud
INNER JOIN estado_general AS eg ON s.id_estado_general = eg.id_estado_general
INNER JOIN  persona AS p ON p.id_usuario = s.id_usuario
LEFT  JOIN (SELECT id_subtipo, desc_subtipo, detalle FROM parametrica  WHERE id_tipo =5 )  as ts 
ON  s.id_tipo_solicitud = ts.id_subtipo	  	 	
WHERE s.id_usuario =$2 AND s.id_estado_solicitud  =$3 AND p.id_estado IN(1,5);`;*/

      const query = `
      SELECT s.id_usuario,  s.id_solicitud, o.id_obra, f.id_ficha,   f.cod_carpeta,  f.desc_cod_ue, eo.nombre_ue,
      f.desc_carpeta, 
      eg.id_estado_general, f.gestion_carpeta,
      COALESCE(NULLIF(ts.desc_subtipo, ''), '') || ' ' || eg.desc_estado_gral AS actividad,
      eg.desc_modulo,   s.id_estado_solicitud,
      s.fecha_registro as fecha, eg.url_formulario, ts.desc_subtipo,
      s.proveido, s.fecha_envio, eg.tooltip
      FROM obra AS o   
      INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
      INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion FROM public.estructura_organizacional
      GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue AND f.gestion_carpeta = eo.gestion
      INNER JOIN solicitud AS s ON o.id_obra = s.id_obra 
      INNER JOIN estado_solicitud  AS es ON  s.id_estado_solicitud = es.id_estado_solicitud
      INNER JOIN estado_general AS eg ON s.id_estado_general = eg.id_estado_general
      LEFT  JOIN (SELECT id_subtipo, desc_subtipo, detalle FROM parametrica  WHERE id_tipo =5 )  as ts 
      ON  s.id_tipo_solicitud = ts.id_subtipo	 
      INNER JOIN  (SELECT id_usuario, id_estado
      FROM public.persona WHERE id_estado IN(1,5) GROUP BY id_usuario, id_estado) AS p ON p.id_usuario = s.id_usuario 
      WHERE s.id_usuario =$2 AND s.id_estado_solicitud  =$3
AND f.gestion_carpeta = $1 AND s.id_estado_registro = 1 ORDER BY  s.fecha_registro DESC`;
      const values = [bandeja.gestion, bandeja.usuario, bandeja.estado]
      const resultado = await this.solicitudRepositorio.query(query, values);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  } 
  
  
   async generarSolicitud(data: GenerarSolicitudDto) {
    try {
      const usuarioDestinoQuery = `
          SELECT idusuario FROM public.sp_permisos_xpersona_filas() WHERE idpermiso IN (85,86)
          AND desccodue = ${data.desccodue};`;
      const params4 = [data.desccodue];
      const usuarioDestinoResult = await this.solicitudRepositorio.query(usuarioDestinoQuery);
      if (!usuarioDestinoResult || usuarioDestinoResult.length === 0) {
        return {
          statusCode: 500,
          message: false,
          error: "Error: No se encontró un usuario destino válido.",
        };
      }
      const usuario = usuarioDestinoResult[0].idusuario;
      const data_solicitud = {
        id_tipo_solicitud: data.id_tipo_solicitud,
        id_estado_solicitud: data.id_estado_solicitud,
        id_obra: data.id_obra,
        id_estado_general: data.id_estado_general,
        id_usuario: usuario,
        proveido: 'SOLICITUD GENEERADA',
        usuario_registro: data.usuario_registro,
        id_estado_registro: 1,
      };

      const resultado = await this.solicitudRepositorio.save(data_solicitud);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async verEtapaSolicitud(data: EtapaSolicitudDto) {
    try {
      const query = `
        SELECT id_obra, id_estado_general FROM solicitud_historial WHERE id_obra =$1 AND id_estado_general =$2;  `;
        const params = [data.obra, data.estado_general]        
      const resultado = await this.solicitudRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async usuarioSolicitud(data: UsuarioSolicitudDto) {
    try {
      const query = `
        SELECT DISTINCT p.id_usuario, TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || RTRIM(p.segundo_apellido) || ' | ' || per.desc_subtipo as nombre
        FROM solicitud_historial sh
        INNER JOIN public.persona AS p ON sh.id_usuario = p.id_usuario 
        INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
        INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
        INNER JOIN public.rol_permiso AS rp ON p.id_persona = pp.id_persona 
        WHERE id_solicitud =$1  AND id_estado_general= $2 AND p.id_estado IN(1,5) AND pp.id_estado =1
        LIMIT 1;  `;

        const values = [data.solicitud, data.estado_general]        
      const resultado = await this.solicitudRepositorio.query(query, values);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  

  async usuarioAsignadoObra(data: UsuarioSolicitudObraDto) {
    try {
      const query = `
        	   SELECT  DISTINCT p.id_usuario, TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || RTRIM(p.segundo_apellido) || ' | ' || per.desc_subtipo as nombre
        ,sh.id_obra
        FROM solicitud_historial sh
        INNER JOIN public.persona AS p ON sh.id_usuario = p.id_usuario 
        INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
        INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
        INNER JOIN public.rol_permiso AS rp ON p.id_persona = pp.id_persona 
        WHERE sh.id_obra =${data.obra}  AND per.id_permiso IN(${data.permiso}) AND p.id_estado IN(1,5) AND pp.id_estado =1
        LIMIT 1; `;
       // const values = [data.obra, data.permiso]        
      const resultado = await this.solicitudRepositorio.query(query);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  } 



  async getTaskCounts(data:ContadorGestionDto): Promise<Record<string, number>> {


          const query = `
      SELECT
      COUNT(*) AS total, f.gestion_carpeta,
      COALESCE(SUM(CASE WHEN id_estado_solicitud = 2 THEN 1 ELSE 0 END), 0) AS pendientes,
      COALESCE(SUM(CASE WHEN id_estado_solicitud = 3 THEN 1 ELSE 0 END), 0) AS enprogreso,
      COALESCE(SUM(CASE WHEN id_estado_solicitud = 4 THEN 1 ELSE 0 END), 0) AS completadas
      FROM public.solicitud AS s
      INNER JOIN public.obra AS o ON s.id_obra = o.id_obra
      INNER JOIN public.ficha AS f ON o.id_ficha = f.id_ficha
      WHERE f.gestion_carpeta = $1 AND id_usuario = $2
      GROUP BY  gestion_carpeta;`;


    try {
      const params =[ data.gestion, data.usuario]
      const result = await this.dataSource.query(query, params);
      return result[0];
    } catch (error) {
      console.error('Error al obtener las estadísticas de tareas:', error);
      throw new Error('No se pudieron obtener las estadísticas de tareas');
    }
  }
  
///////////////////////////////////////HISTORIAL//////////////////////////
async createHistorial(createSolicitudHistorialDto: CreateSolicitudHistorialDto) {
  try {
    const resultado = await this.solicitudHisRepositorio.save(createSolicitudHistorialDto);
    return this.responseService.success(resultado, "Registrado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }  }


async updateHistorial(id: number, updateSolicitudHistorialDto: UpdateSolicitudHistorialDto) {
  try {
    const resultado = await this.solicitudHisRepositorio.update(id, updateSolicitudHistorialDto)
    return this.responseService.success(id, "Actualizado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }

}


async listaHistorialXObra(data: HistorialObraDto) {
  try {
    const query = `
        SELECT s.id_obra, s.id_solicitud,  s.fecha_envio, desc_modulo, desc_estado_gral,
        p.id_usuario, pro.detalle || ' ' || TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || TRIM(p.segundo_apellido)  as nombre,
        s.proveido
        FROM public.solicitud AS s 
        INNER JOIN public.solicitud_historial AS sh ON s.id_solicitud = sh.id_solicitud
        INNER JOIN public.estado_general AS eg ON sh.id_estado_general = eg.id_estado_general
        INNER JOIN  public.persona AS p ON sh.id_usuario = p.id_usuario
        INNER JOIN (SELECT id_subtipo, desc_subtipo, detalle FROM parametrica  WHERE id_tipo =2 )  as pro ON  p.id_profesion = pro.id_subtipo      
        WHERE 
        s.id_obra =$1 AND
        p.id_estado IN (1,5);`;
    const params = [data.obra]        
    const resultado = await this.solicitudRepositorio.query(query, params);
    return this.responseService.success(resultado, "Listado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }
} 



async listaHistorialXSolicitud(data: HistorialSolicitudDto) {
  try {


    const query = `
        SELECT  sh.id_solicitud_historial, s.id_obra, s.id_solicitud, s.fecha_envio, sh.fecha_registro, desc_modulo, desc_estado_gral,
        p.id_usuario, 
        --pro.detalle || ' ' ||
        TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || TRIM(p.segundo_apellido)  as nombre
        ,sh.proveido
        FROM public.solicitud AS s 
        INNER JOIN public.solicitud_historial AS sh ON s.id_solicitud = sh.id_solicitud
        INNER JOIN public.estado_general AS eg ON sh.id_estado_general = eg.id_estado_general
        INNER JOIN  (SELECT  DISTINCT id_usuario, id_estado, nombre, primer_apellido, segundo_apellido   FROM public.persona 
        WHERE id_estado IN(1,5) )AS p ON   sh.id_usuario =  p.id_usuario
        --INNER JOIN (SELECT id_subtipo, desc_subtipo, detalle FROM parametrica WHERE id_tipo =2 )  as pro ON  p.id_profesion = pro.id_subtipo      
        WHERE s.id_solicitud =$1 AND
        p.id_estado IN (1,5) AND sh.id_estado_general <>0  AND  sh.id_estado_registro <>0  ORDER BY sh.id_solicitud_historial DESC; `;
    const params = [data.id_solicitud]        
    const resultado = await this.solicitudRepositorio.query(query, params);
    return this.responseService.success(resultado, "Listado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }
} 


async usuarioSolicitudXObra(data: UsuarioSolicitudXObraDto) {
  try {
    const query = `
      SELECT  DISTINCT p.id_usuario, TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || RTRIM(p.segundo_apellido) || ' | ' || per.desc_subtipo as nombre
        FROM solicitud_historial sh
        INNER JOIN public.persona AS p ON sh.id_usuario = p.id_usuario 
        INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
        INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) 
		AS per ON pp.id_permiso = per.id_permiso  
        WHERE id_obra =$1  AND id_estado_general= $2
        LIMIT 1; `;

      const values = [data.id_obra, data.estado_general]        
    const resultado = await this.solicitudRepositorio.query(query, values);
    return this.responseService.success(resultado, "Listado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }
}


async guardarHistorialYActualizar(data: ActualizarSolicitudDto) {
  try {

    console.log(data);
    
    console.log('Ejecutando sp_modificacion_historial con:');
    console.log('Solicitud:', data.p_id_solicitud);
    console.log('Usuario:', data.p_id_usuario);
    console.log('Usuario Registro:', data.p_usuario_registro);
    console.log('Estado:', data.p_id_estado_general);
    console.log('Proveído:', data.p_proveido);

   /* const query = `SELECT public.sp_modificacion_historial(${data.p_id_solicitud}, 
    ${data.p_id_usuario}, ${data.p_usuario_registro}, ${data.p_id_estado_general}, ${data.p_proveido}) AS id_historial`;*/

const query = `SELECT public.sp_modificacion_historial($1, $2, $3, $4, $5) AS id_historial`;    
    const params = [
      data.p_id_solicitud,
      data.p_id_usuario,
      data.p_usuario_registro,
      data.p_id_estado_general,
      data.p_proveido,
    ];

    const resultado = await this.solicitudRepositorio.query(query, params);
    console.log('Resultado del SP:', resultado);

    return this.responseService.success(resultado, "Ejecutado correctamente.");
  } catch (error:any) {
    console.error('❌ Error al ejecutar sp_modificacion_historial:', {
      message: error.message,
      detail: error.detail,
      stack: error.stack,
    });
    return this.responseService.error(error);
  }
}





}