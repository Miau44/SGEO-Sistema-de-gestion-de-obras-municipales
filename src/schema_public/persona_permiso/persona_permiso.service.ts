import { Injectable } from '@nestjs/common';
import { CreatePersonaPermisoDto } from './dto/create-persona_permiso.dto';
import { UpdatePersonaPermisoDto } from './dto/update-persona_permiso.dto';
import { And, Any, Not, Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { PersonaPermiso } from './entities/persona_permiso.entity';
import { UsuarioDto } from './dto/usuario.dto';



@Injectable()
export class PersonaPermisoService {

  constructor(
    @InjectRepository(PersonaPermiso) private pperRepositorio: Repository<PersonaPermiso>,
    private responseService: ResponseService

  ) { }

  async create(createPersonaPermisoDto: CreatePersonaPermisoDto) {
    try {
      const resultado = await this.pperRepositorio.save(createPersonaPermisoDto);
      return this.responseService.success(resultado, "GUardado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all personaPermiso`;
  }

  async findOne(id_persona_permiso: number) {
    try {
      const resultado = await this.pperRepositorio.findOneBy({ id_persona_permiso });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async update(id: number, updatePersonaPermisoDto: UpdatePersonaPermisoDto) {
    try {
      const resultado = await this.pperRepositorio.update(id, updatePersonaPermisoDto)
      return this.responseService.success(id, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} personaPermiso`;
  }

  async listarUsuarioPermiso(datosDto: UsuarioDto) {
    try {
      const query = `SELECT pp.id_persona_permiso,  per.desc_subtipo  FROM public.persona AS p
INNER JOIN public.persona_permiso AS pp ON p.id_persona = pp.id_persona 
INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
WHERE p.usuario = $1`;
      const params = [ datosDto.usuario];
      const resultado = await this.pperRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
}
