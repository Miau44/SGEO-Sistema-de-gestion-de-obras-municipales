import { Injectable, } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';

import { Persona } from './entities/persona.entity';

import { EstructuraDto } from './dto/estructuraDto.dto';
import { ResponseService } from 'src/response.service';

@Injectable()
export class PersonaService {


  constructor(@InjectRepository(Persona) private personaRepo: Repository<Persona>,
    private responseService: ResponseService) { }


  create(createPesonaDto: CreatePersonaDto) {
    try {
      const resultado = this.personaRepo.save(createPesonaDto);
      return this.responseService.success(resultado, "Registrado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

async  findAll() {
    try {
      const resultado =  await this.personaRepo.find()
      return this.responseService.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

 async findOne(id_persona: number) {
    try {
      const resultado =  await this.personaRepo.findOneBy({ id_persona });
      return this.responseService.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  async update(id_persona: number, updatePersonaDto: UpdatePersonaDto) {
    try {
      const resultado =  await this.personaRepo.update(id_persona, updatePersonaDto)
      return this.responseService.success(id_persona, "Actualizado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }        
  }

  remove(id: number) {
    return `This action removes a #${id} persona`;
  }


  //merge de repuesta de usuarios de seguridad con personas sgeo
  async listaGeneralPersonas(estructuraDto: EstructuraDto) {
    try {
      //externo
      const datosSeguridad = 'http://192.168.8.4:84/api/v1/servicio/listarUsuariosXuo';
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          estructuraDto
        ),
      };
      const response = await fetch(datosSeguridad, options);
      const resultadoUsuarios = await response.json()

      //interno
      const query = `SELECT id_persona,  id_usuario FROM persona  `;
      const resultadoSgeo: any[] = await this.personaRepo.query(query);
      const resultadoSeguridad: any[] = resultadoUsuarios.data

      const resultado = resultadoSeguridad.map(seguridad => {
        const asignado = resultadoSgeo.filter(sgeo => sgeo.id_usuario === seguridad.idusuario);
        return { seguridad, sgeo: asignado };
      });
      return this.responseService.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }


  }

}
