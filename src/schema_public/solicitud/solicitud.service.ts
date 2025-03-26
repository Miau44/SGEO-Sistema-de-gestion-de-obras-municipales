import { Injectable } from '@nestjs/common';
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




@Injectable()
export class SolicitudService {


  constructor(@InjectRepository(Solicitud) private solicitudRepositorio: Repository<Solicitud>,
  @InjectRepository(SolicitudHistorial) private solicitudHisRepositorio: Repository<SolicitudHistorial>,    
  private responseService: ResponseService,
  @InjectDataSource() private readonly dataSource: DataSource
) { }

async  create(createSolicitudDto: CreateSolicitudDto) {
    try {
      const resultado = await this.solicitudRepositorio.save(createSolicitudDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
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
      const query = `
SELECT s.id_solicitud, o.id_obra, f.id_ficha,   f.cod_carpeta,  f.desc_cod_ue, f.desc_carpeta, 
eo.gestion, eg.id_estado_general, 
--ts.desc_subtipo  || ' ' ||  eg.desc_estado_gral  AS actividad, 
COALESCE(NULLIF(ts.desc_subtipo, ''), '') || ' ' || eg.desc_estado_gral AS actividad,

eg.desc_modulo,   s.id_estado_solicitud,
s.fecha_registro as fecha, eg.url_formulario, ts.desc_subtipo,
s.proveido, s.fecha_envio
FROM obra AS o   
INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
WHERE  gestion =$1 GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
INNER JOIN solicitud AS s ON o.id_obra = s.id_obra
INNER JOIN estado_solicitud  AS es ON  s.id_estado_solicitud = es.id_estado_solicitud
INNER JOIN estado_general AS eg ON s.id_estado_general = eg.id_estado_general
INNER JOIN  persona AS p ON p.id_usuario = s.id_usuario
LEFT  JOIN (SELECT id_subtipo, desc_subtipo, detalle FROM parametrica  WHERE id_tipo =5 )  as ts 
ON  s.id_tipo_solicitud = ts.id_subtipo	  	 	
WHERE s.id_usuario =$2 AND s.id_estado_solicitud  =$3 AND p.id_estado IN(1,5)
      `;
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
        WHERE id_solicitud =$1  AND id_estado_general= $2
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
        WHERE sh.id_obra =${data.obra}  AND per.id_permiso IN(${data.permiso})
        LIMIT 1; 
 `;

       // const values = [data.obra, data.permiso]        
      const resultado = await this.solicitudRepositorio.query(query);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  } 



  async getTaskCounts(usuario: number): Promise<Record<string, number>> {
    const query = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN id_estado_solicitud = 2 THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN id_estado_solicitud = 3 THEN 1 ELSE 0 END) AS enProgreso,
        SUM(CASE WHEN id_estado_solicitud = 4 THEN 1 ELSE 0 END) AS completadas
      FROM public.solicitud
      WHERE id_usuario = $1;
    `;
    try {
      const result = await this.dataSource.query(query, [usuario]);
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
        p.id_usuario, pro.detalle || ' ' || TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || TRIM(p.segundo_apellido)  as nombre
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
        SELECT  sh.id_solicitud_historial, s.id_obra, s.id_solicitud,  s.fecha_envio, desc_modulo, desc_estado_gral,
        p.id_usuario, pro.detalle || ' ' || TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || TRIM(p.segundo_apellido)  as nombre
        ,s.proveido
        FROM public.solicitud AS s 
        INNER JOIN public.solicitud_historial AS sh ON s.id_solicitud = sh.id_solicitud
        INNER JOIN public.estado_general AS eg ON sh.id_estado_general = eg.id_estado_general
        INNER JOIN  public.persona AS p ON sh.id_usuario = p.id_usuario
        INNER JOIN (SELECT id_subtipo, desc_subtipo, detalle FROM parametrica  WHERE id_tipo =2 )  as pro ON  p.id_profesion = pro.id_subtipo      
        WHERE 
        s.id_solicitud =$1 AND
        p.id_estado IN (1,5) ORDER BY sh.id_solicitud_historial DESC; `;
    const params = [data.id_solicitud]        
    const resultado = await this.solicitudRepositorio.query(query, params);
    return this.responseService.success(resultado, "Listado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }
} 


}