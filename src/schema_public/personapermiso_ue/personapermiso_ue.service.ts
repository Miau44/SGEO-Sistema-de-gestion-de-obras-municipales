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
        WHERE gestion =$1 GROUP BY desc_cod_ue,nombre_ue,sigla_ue, gestion) as ue ON ppue.desc_cod_ue = ue.desc_cod_ue
        WHERE p.usuario = $2 AND ppue.id_estado =1`;
      const params = [datosDto.gestion, datosDto.usuario];
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
	         id_persona_permiso, desc_cod_ue, usuario_registro, id_estado, fecha_registro, fecha_modificacion)				
			VALUES( ${data.id_persona_permiso}, rec.desc_cod_ue, ${data.usuario_registro}, ${data.id_estado}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
			
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
      const query = `SELECT p.id_usuario, p.nombre || ' ' || p.primer_apellido || ' ' || p.segundo_apellido as nombre,  p.id_usuario, 
per.desc_subtipo,  ppue.desc_cod_ue
FROM public.persona AS p
INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
INNER JOIN public.personapermiso_ue AS ppue ON pp.id_persona_permiso = ppue.id_persona_permiso
INNER  JOIN (SELECT desc_cod_ue, nombre_ue, sigla_ue, gestion from estructura_organizacional AS ue 
WHERE gestion =2024 GROUP BY desc_cod_ue,nombre_ue,sigla_ue, gestion) as ue ON ppue.desc_cod_ue = ue.desc_cod_ue
       WHERE  pp.id_estado =1 AND ppue.id_estado=1 AND  per.id_permiso IN(${datosDto.id_permiso})  
       AND  p.id_estado IN(1,5)  AND ppue.desc_cod_ue =${datosDto.desc_cod_ue};`;
     // const params = [datosDto.id_permiso, datosDto.desc_cod_ue];
      const resultado = await this.pperUeRepositorio.query(query);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }				
    

}
