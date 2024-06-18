import { Injectable, } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { EstructuraDto } from './dto/estructuraDto.dto';

@Injectable()
export class PersonaService {


  constructor(@InjectRepository(Persona) private personaRepo: Repository<Persona>) { }


  create(createPesonaDto: CreatePersonaDto) {
      return this.personaRepo.save(createPesonaDto);
  }
  findAll() {
  return this.personaRepo.find()
  }

  findOne(id_persona: number) {
    return this.personaRepo.findOneBy({id_persona});
  }

  update(id_persona: number, updatePersonaDto: UpdatePersonaDto) {
  
    try {
      return this.personaRepo.update(id_persona, updatePersonaDto)
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
        data: id_persona,
      };
    }    
  }

  remove(id: number) {
    return `This action removes a #${id} persona`;
  }

  
//merge de repuesta de usuarios de seguridad con personas sgeo
  async listaGeneralPersonas(estructuraDto: EstructuraDto) {
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
    const query =`SELECT id_usuario FROM persona  `;
    const resultadoSgeo:any[] = await this.personaRepo.query(query);
    const resultadoSeguridad:any[] = resultadoUsuarios.data
    
    const MergeData = resultadoSeguridad.map(seguridad => {
      const asignado = resultadoSgeo.filter(sgeo => sgeo.id_usuario === seguridad.idusuario);
      return { seguridad, sgeo:asignado};
    });

    return MergeData;


  }

}
