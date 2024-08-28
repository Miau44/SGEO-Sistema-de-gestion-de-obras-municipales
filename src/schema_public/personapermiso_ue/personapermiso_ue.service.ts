import { Injectable } from '@nestjs/common';
import { CreatePersonapermisoUeDto } from './dto/create-personapermiso_ue.dto';
import { UpdatePersonapermisoUeDto } from './dto/update-personapermiso_ue.dto';
import { And, Any, Not, Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { PersonapermisoUe } from './entities/personapermiso_ue.entity';
import { PermisoXUeDto } from './dto/datos.dto';

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
      const query = `SELECT ue.gestion,  per.desc_subtipo, ue.desc_cod_ue, ue.nombre_ue  FROM public.persona AS p
INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
INNER JOIN public.personapermiso_ue AS ppue ON pp.id_persona_permiso = ppue.id_persona_permiso
INNER  JOIN (SELECT desc_cod_ue, nombre_ue, sigla_ue, gestion from estructura_organizacional AS ue 
WHERE gestion =$1 GROUP BY desc_cod_ue,nombre_ue,sigla_ue, gestion) as ue ON ppue.desc_cod_ue = ue.desc_cod_ue
WHERE p.usuario = $2`;
      const params = [datosDto.gestion, datosDto.usuario];
      const resultado = await this.pperUeRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
}
