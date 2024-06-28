import { Injectable, } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';

import { Persona } from './entities/persona.entity';

import { EstructuraDto } from './dto/estructuraDto.dto';
import { ResponseService } from 'src/response.service';
import { EstructuraGralDto } from './dto/estructuraGral.dto';
import { EstructuraDaDto } from './dto/estructuraDa.dto';

@Injectable()
export class PersonaService {


  constructor(@InjectRepository(Persona) private personaRepo: Repository<Persona>,
    private responseService: ResponseService) { }



  async create(createPesonaDto: CreatePersonaDto) {
    try {
      const resultado = await this.personaRepo.save(createPesonaDto);
      return this.responseService.success(resultado, "Listado Correctamente")
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
  async listaPersonasXRol(estructuraDto: EstructuraDto) {
    try {
      //externo seguridad
      //const datosSeguridad = 'http://192.168.8.4:84/api/v1/servicio/listarUsuariosXuo';
      const datosSeguridad = process.env.URL_SEGURIDAD + 'listarUsuariosXuo';
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
      const query = `SELECT  p.id_usuario, p.id_persona, pa.desc_subtipo as profesion, p.registro_profesional, p.fecha_aprobacion, p.fecha_registro, p.nombre_da_comision FROM persona as  p
      LEFT JOIN parametrica pa ON id_profesion = pa.id_subtipo WHERE pa.id_tipo = 2  `;
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


  async listaGeneralPersonas(estructuraGralDto: EstructuraGralDto) {
    try {
      //externo sistema seguridad
     // const datosSeguridad = 'http://192.168.8.4:84/api/v1/servicio/listarUsuariosXcodigouo';
      const datosSeguridad = process.env.URL_SEGURIDAD + 'listarUsuariosXcodigouo';

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          estructuraGralDto
        ),
      };
      const response = await fetch(datosSeguridad, options);
      const resultadoUsuarios = await response.json()

      //interno
      const query = `SELECT  id_usuario, id_persona, id_profesion, registro_profesional, fecha_aprobacion, fecha_registro, desc_cod_ue, desc_cod_da, desc_cod_da_comision, nombre_da_comision FROM public.persona   `;
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

  async token() {
    // const url = 'http://gmlpsr00037:3100/api/service/dlc/wsToken'; //SERVIDOR PRODUCCIÓN
    const url = process.env.URL_SIM + 'wsToken';
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "usuario": "usersim",
        "clave": "usersim123456"
      }),
    };
    const response = await fetch(url, options);
    const resultado = await response.json();
    return resultado.datos.token;
  }


  async estructuraDa(estructuraDa: EstructuraDaDto) {
    try {
      const v_token = await this.token();
      //const url = 'http://gmlpsr00037:3100/api/service/dlc/wsEstructuraOrganizacional'; //SERVIDOR DE PRODUCCIÓN
      const url = process.env.URL_SIM + 'wsEstructuraOrganizacional';

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${v_token}`,
        },
        body: JSON.stringify(estructuraDa)
      };
      const response = await fetch(url, options);
      const resultado = await response.json();
      
      const nuevoArray: any = [];
      if (resultado) {
        const datosResumidos = resultado.datos.filter((item: any, index: any, self: any) => {
          return index === self.findIndex((t: any) => t.gestion === item.gestion && t.desc_cod_da === item.desc_cod_da);
        });
    
    
        if (datosResumidos) {
          for (var i = 0; i < datosResumidos.length; i++) {
            const nuevoElemento = {
              gestion: datosResumidos[i].gestion,
              cod_da: datosResumidos[i].cod_da,
              desc_cod_da: datosResumidos[i].desc_cod_da,
              nombre_da: datosResumidos[i].nombre_da,
              sigla_da: datosResumidos[i].sigla_da
            };
            nuevoArray.push(nuevoElemento);
          }
        }
      }
      const respuesta = nuevoArray
      return this.responseService.success(respuesta, "Listado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }

  }
}
