import { Injectable } from '@nestjs/common';
import { CreatePersonapermisoUeDto } from './dto/create-personapermiso_ue.dto';
import { UpdatePersonapermisoUeDto } from './dto/update-personapermiso_ue.dto';
import { And, Any, Not, Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { PersonapermisoUe } from './entities/personapermiso_ue.entity';
import { PermisoXUeDto } from './dto/datos.dto';
import { TodaslasUesDto } from './dto/todaslasUes.dto';
import { log } from 'console';
import { UsuarioPermisoXUeDto } from './dto/usuario_permiso_ue.dto';

@Injectable()
export class PersonapermisoUeService {


  constructor(
    @InjectRepository(PersonapermisoUe) private pperUeRepositorio: Repository<PersonapermisoUe>,
    private responseService: ResponseService

  ) { }

  async create(createPersonapermisoUeDto: CreatePersonapermisoUeDto) {
    try {
      const resultado = await this.pperUeRepositorio.save(createPersonapermisoUeDto);
      return this.responseService.success(resultado, "GUardado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all personapermisoUe`;
  }

  async findOne(id_personapermiso_ue: number) {
    try {
      const resultado = await this.pperUeRepositorio.findOneBy({ id_personapermiso_ue });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }



  async update(id: number, updatePersonapermisoUeDto: UpdatePersonapermisoUeDto) {
    try {
      const resultado = await this.pperUeRepositorio.update(id, updatePersonapermisoUeDto)
      return this.responseService.success(id, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} personapermisoUe`;
  }



  async listarPermisosXUe(datosDto: PermisoXUeDto) {
    try {
              const query = `SELECT ppue.id_personapermiso_ue, ue.gestion,  per.desc_subtipo, ue.desc_cod_ue, ue.nombre_ue  FROM public.persona AS p
        INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
        INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
        INNER JOIN public.personapermiso_ue AS ppue ON pp.id_persona_permiso = ppue.id_persona_permiso
        INNER  JOIN (SELECT desc_cod_ue, nombre_ue, sigla_ue, gestion from estructura_organizacional AS ue 
        GROUP BY desc_cod_ue,nombre_ue,sigla_ue, gestion) as ue ON ppue.desc_cod_ue = ue.desc_cod_ue AND ppue.gestion = ue.gestion
        WHERE ppue.gestion = $1 AND  p.usuario = $2 AND ppue.id_estado =1`;
      const params = [datosDto.gestion, datosDto.usuario];
      const resultado = await this.pperUeRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listarPermisosXUEAdm(datosDto: PermisoXUeDto) {
    try {
              const query = `SELECT ppue.id_personapermiso_ue, ue.gestion,  per.desc_subtipo, ue.desc_cod_ue, ue.nombre_ue  FROM public.persona AS p
        INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
        INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
        INNER JOIN public.personapermiso_ue AS ppue ON pp.id_persona_permiso = ppue.id_persona_permiso
        INNER  JOIN (SELECT desc_cod_ue, nombre_ue, sigla_ue, gestion from estructura_organizacional AS ue 
        GROUP BY desc_cod_ue,nombre_ue,sigla_ue, gestion) as ue ON ppue.desc_cod_ue = ue.desc_cod_ue AND ppue.gestion = ue.gestion
        WHERE  p.usuario = $1
               AND ppue.gestion = $2
               AND ppue.id_estado =1  `;
      const params = [ datosDto.usuario, datosDto.gestion];
      const resultado = await this.pperUeRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
  


  async insertarTodaslasUe(data:TodaslasUesDto) {
    try{
          const query = `DO $$
    DECLARE
        rec RECORD;
    BEGIN
        FOR rec IN 
   			
	      SELECT desc_cod_ue  FROM public.estructura_organizacional
            WHERE gestion  = ${data.gestion} 
			
        LOOP         
			INSERT INTO public.personapermiso_ue(
	         id_persona_permiso, gestion, desc_cod_ue, usuario_registro, id_estado, fecha_registro, fecha_modificacion)				
			VALUES( ${data.id_persona_permiso}, ${data.gestion} ,  rec.desc_cod_ue, ${data.usuario_registro}, ${data.id_estado}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
			
        END LOOP;
    END;
    $$;
    `;
  //  const params = [data.gestion, data.id_persona_permiso, data.usuario_registro, data.id_estado];
    const resultado = await this.pperUeRepositorio.query(query);    
      return this.responseService.success(resultado, "Ue's Asignadas")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async usuarioXPermisoXUe(datosDto: UsuarioPermisoXUeDto) {
    try {
      if(datosDto.obra > 0){ // fiscales y supervisores
     /* const query = `
      SELECT p.id_usuario,  p.usuario, TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || RTRIM(p.segundo_apellido) || ' | ' || per.desc_subtipo as nombre,  p.id_usuario, 
      per.desc_subtipo,  ppue.desc_cod_ue, d.id_obra, f.gestion_carpeta as gestion 
      FROM public.persona AS p
      INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
      INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
      INNER JOIN public.personapermiso_ue AS ppue ON pp.id_persona_permiso = ppue.id_persona_permiso
      INNER  JOIN (SELECT desc_cod_ue, nombre_ue, sigla_ue, gestion from estructura_organizacional AS ue 
      GROUP BY desc_cod_ue,nombre_ue,sigla_ue, gestion) as ue ON ppue.desc_cod_ue = ue.desc_cod_ue  AND ppue.gestion = ue.gestion
      INNER JOIN public.designacion AS d ON  p.id_persona = d.id_persona 
      INNER JOIN public.obra AS o ON o.id_obra = d.id_obra
      INNER JOIN public.ficha AS f ON f.id_ficha = o.id_ficha
      WHERE  pp.id_estado =1 AND ppue.id_estado=1  
      AND d.id_estado=1 
      AND per.id_permiso IN(${datosDto.id_permiso})
      AND  p.id_estado IN(1,5)  
       AND d.estado_designacion IN(99,105,102)
     --AND ppue.gestion =${datosDto.gestion}        
     --  AND ppue.desc_cod_ue =${datosDto.desc_cod_ue}   
       AND  d.id_obra =${datosDto.obra};`;*/
      const query = `
        SELECT DISTINCT p.id_usuario,  p.usuario, TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || RTRIM(p.segundo_apellido) || ' | ' 
        ||  CASE WHEN id_cite_memo =239 THEN 'SUPERVISOR ' 
        WHEN id_cite_memo =240 THEN 'FISCAL ' ELSE '' END  AS nombre,  p.id_usuario, 
        CASE WHEN id_cite_memo =239 THEN 'SUPERVISOR ' 
        WHEN id_cite_memo =240 THEN 'FISCAL ' ELSE '' END AS desc_subtipo,
        f.desc_cod_ue, d.id_obra, f.gestion_carpeta as gestion

        FROM public.persona AS p
        INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
        INNER JOIN public.designacion AS d ON  p.id_persona = d.id_persona 
        INNER JOIN public.obra AS o ON o.id_obra = d.id_obra
        INNER JOIN public.ficha AS f ON f.id_ficha = o.id_ficha
        WHERE id_cite_memo IN (
        SELECT CASE  WHEN x = 84 THEN 239 WHEN x = 83 THEN 240 END FROM unnest(ARRAY[${datosDto.id_permiso}]) AS x
        ) AND p.id_estado IN(1,5) AND d.id_obra =${datosDto.obra} AND d.id_estado=1 AND d.estado_designacion IN(99,102) AND pp.id_estado =1; `;
        const resultado = await this.pperUeRepositorio.query(query);
        return this.responseService.success(resultado, "Listado Correctamente.")
        
      }else{ //personas que no son supervisores y fiscales
        
        /* SELECT DISTINCT p.id_usuario,  p.id_usuario, TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || RTRIM(p.segundo_apellido) || ' | ' || p.puesto as nombre,  p.id_usuario, 
        ppue.desc_cod_ue
        FROM public.persona AS p
        INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
        INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
        INNER JOIN public.personapermiso_ue AS ppue ON pp.id_persona_permiso = ppue.id_persona_permiso
        INNER  JOIN (SELECT desc_cod_ue, nombre_ue, sigla_ue, gestion from estructura_organizacional AS ue 
        WHERE gestion =${datosDto.gestion} GROUP BY desc_cod_ue,nombre_ue,sigla_ue, gestion) as ue ON ppue.desc_cod_ue = ue.desc_cod_ue
        WHERE  pp.id_estado =1 AND ppue.id_estado=1 AND  per.id_permiso IN(${datosDto.id_permiso})  
        AND  p.id_estado IN(1,5)  AND ppue.desc_cod_ue =${datosDto.desc_cod_ue};*/

     /*   const query = `       
        SELECT DISTINCT p.id_usuario,  p.id_usuario, TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || RTRIM(p.segundo_apellido) || ' | ' || p.puesto as nombre,  p.id_usuario, 
        ppue.desc_cod_ue
        FROM public.persona AS p
        INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
        INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
        AND ppue.gestion = ue.gestion
        INNER JOIN public.personapermiso_ue AS ppue ON pp.id_persona_permiso = ppue.id_persona_permiso
        INNER  JOIN (SELECT desc_cod_ue, nombre_ue, sigla_ue, gestion from estructura_organizacional AS ue 
        GROUP BY desc_cod_ue,nombre_ue,sigla_ue, gestion) as ue ON ppue.desc_cod_ue = ue.desc_cod_ue
        WHERE  pp.id_estado =1 AND ppue.id_estado=1  AND  per.id_permiso IN(${datosDto.id_permiso})  
        AND  p.id_estado IN(1,5)  
        AND ppue.gestion =${datosDto.gestion};
        AND ppue.desc_cod_ue =${datosDto.desc_cod_ue};`;  */


        const query = ` 
        SELECT DISTINCT p.id_usuario,  p.usuario, TRIM(p.nombre) || ' ' || TRIM(p.primer_apellido) || ' ' || RTRIM(p.segundo_apellido) || ' | ' || p.puesto as nombre,  p.id_usuario, 
        ppue.desc_cod_ue
        FROM public.persona AS p
        INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
        INNER JOIN public.personapermiso_ue AS ppue ON pp.id_persona_permiso = ppue.id_persona_permiso
        INNER  JOIN (SELECT desc_cod_ue, nombre_ue, sigla_ue, gestion from estructura_organizacional AS ue 
        GROUP BY desc_cod_ue,nombre_ue,sigla_ue, gestion) as ue ON ppue.desc_cod_ue = ue.desc_cod_ue
        INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
        AND ppue.gestion = ue.gestion
        WHERE  pp.id_estado =1 AND ppue.id_estado=1  AND  per.id_permiso IN(${datosDto.id_permiso})
        AND  p.id_estado IN(1,5)  
        AND ppue.gestion =${datosDto.gestion}
        AND ppue.desc_cod_ue =${datosDto.desc_cod_ue};`;  
        const resultado = await this.pperUeRepositorio.query(query);
        return this.responseService.success(resultado, "Listado Correctamente.")        
      }
      
    } catch (error) {
      return this.responseService.error(error);
    }
  }				
    

}
