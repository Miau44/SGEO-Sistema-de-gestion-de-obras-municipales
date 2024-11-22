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




@Injectable()
export class SolicitudService {


  constructor(@InjectRepository(Solicitud) private solicitudRepositorio: Repository<Solicitud>,
  private responseService: ResponseService,
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
      const query = `SELECT s.id_solicitud, o.id_obra, f.id_ficha,   f.cod_carpeta,  f.desc_cod_ue, f.desc_carpeta, 
      eo.gestion, eg.id_estado_general, eg.desc_estado_gral AS actividad,   s.id_estado_solicitud,
     s.fecha_registro as fecha, eg.url_formulario
     FROM obra AS o   
     INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
     INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
     WHERE  gestion =$1 GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
     INNER JOIN solicitud AS s ON o.id_obra = s.id_obra
     INNER JOIN estado_solicitud  AS es ON  s.id_estado_solicitud = es.id_estado_solicitud
     INNER JOIN estado_general AS eg ON s.id_estado_general = eg.id_estado_general
     INNER JOIN  persona AS p ON p.id_usuario = s.id_usuario
     WHERE s.id_usuario =$2 AND s.id_estado_solicitud  =$3 AND p.id_estado IN(1,5) `;
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
        SELECT DISTINCT p.id_usuario, TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || RTRIM(p.segundo_apellido) || '/ ' || per.desc_subtipo as nombre
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

}
