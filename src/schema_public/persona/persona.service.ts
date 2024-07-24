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
import { RolDto } from './dto/rolDTO.dto';
@Injectable()
export class PersonaService {


  constructor(@InjectRepository(Persona) private personaRepo: Repository<Persona>,
    private responseService: ResponseService) { }



  async create(createPesonaDto: CreatePersonaDto) {
    try {
      const resultado = await this.personaRepo.save(createPesonaDto);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

async  findAll() {
    try {
      const resultado = await this.personaRepo.find()
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

 async findOne(id_persona: number) {
    try {
      const resultado = await this.personaRepo.findOneBy({ id_persona });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  async update(id_persona: number, updatePersonaDto: UpdatePersonaDto) {
    try {
      const resultado = await this.personaRepo.update(id_persona, updatePersonaDto)
      return this.responseService.success(id_persona, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }        
  }

  remove(id: number) {
    return `This action removes a #${id} persona`;
  }


  //solicitud designaciones
  async listaPersonas(data: RolDto) {
    try { 
      const { id_rol, gestion } = data;
      const pid_rol = id_rol.map((_, index) => `$${index + 1}`).join(',');
      const pgestion = `$${id_rol.length + 1}`;

      /*const query = `SELECT  p.id_usuario, p.id_persona, p.nombre as pnombre, p.primer_apellido as pprimer_apellido, 
    p.segundo_apellido as psegundo_apellido, 
    pro.id_subtipo as id_profesion, pro.desc_subtipo as profesion, p.registro_profesional, 
    p.fecha_aprobacion, p.fecha_registro, eo.nombre_da as nombre_da_comision, p.desc_cod_da_comision
    ,per.id_subtipo as id_permiso, per.desc_subtipo as desc_permiso
    FROM persona as  p
    INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =2 )  as pro ON  p.id_profesion = pro.id_subtipo
    INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =7 )  as per ON  p.id_permiso = per.id_subtipo
    INNER JOIN (SELECT  desc_cod_da, nombre_da, gestion from estructura_organizacional
      WHERE  gestion =${pgestion} GROUP BY desc_cod_da,nombre_da, gestion)  eo ON p.desc_cod_da_comision= eo.desc_cod_da
      WHERE p.gestion =${pgestion} AND p.id_permiso IN(${pid_rol})`;*/
      const query = `SELECT  p.id_usuario, p.id_persona, p.nombre as pnombre, p.primer_apellido as pprimer_apellido, 
      p.segundo_apellido as psegundo_apellido, 
      pro.id_subtipo as id_profesion, pro.desc_subtipo as profesion, p.registro_profesional, 
      p.fecha_aprobacion, p.fecha_registro, eo.nombre_da as nombre_da_comision, p.desc_cod_da_comision, p.id_permiso
      FROM persona as  p
      INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =2 )  as pro ON  p.id_profesion = pro.id_subtipo
      INNER JOIN (SELECT  desc_cod_da, nombre_da, gestion from estructura_organizacional
      WHERE  gestion =${pgestion}  GROUP BY desc_cod_da,nombre_da, gestion)  
      eo ON p.desc_cod_da_comision= eo.desc_cod_da
      LEFT JOIN ( SELECT id_persona, unnest(string_to_array(id_permiso::text, ','::text)) AS elemento FROM persona
      ) as per ON p.id_persona = per.id_persona
      WHERE per.elemento  IN((SELECT CAST(${pid_rol} AS TEXT)) )
      AND p.gestion =${pgestion}
      GROUP BY p.id_usuario, p.id_persona, p.nombre , p.primer_apellido ,
      p.segundo_apellido ,
      pro.id_subtipo , pro.desc_subtipo , p.registro_profesional, 
      p.fecha_aprobacion, p.fecha_registro, eo.nombre_da , p.desc_cod_da_comision`;

      //const values = id_rol 
      const resultado: any[] = await this.personaRepo.query(query, [...id_rol, gestion]);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  //menu asignaciones
    //merge de repuesta de usuarios de seguridad con personas sgeo 
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
     /* const query = `SELECT DISTINCT p.id_usuario, p.id_persona,  pa.id_subtipo as id_profesion, pa.desc_subtipo as profesion, p.registro_profesional, 
      p.fecha_aprobacion, p.fecha_registro, eo.nombre_da as nombre_da_comision, p.desc_cod_da_comision FROM persona as  p
      LEFT JOIN parametrica pa ON id_profesion = pa.id_subtipo 
      INNER JOIN estructura_organizacional eo ON p.desc_cod_da_comision= eo.desc_cod_da
      WHERE pa.id_tipo = 2 AND p.gestion =2024 `;*/
      
      const query = `  SELECT  p.id_usuario, p.id_persona, p.nombre as pnombre, p.primer_apellido as pprimer_apellido, 
        p.segundo_apellido as psegundo_apellido, 
        pro.id_subtipo as id_profesion, pro.desc_subtipo as profesion, p.registro_profesional, 
        p.fecha_aprobacion, p.fecha_registro, eo.nombre_da as nombre_da_comision, p.desc_cod_da_comision, p.id_permiso
        FROM persona as  p
        INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =2 )  as pro ON  p.id_profesion = pro.id_subtipo
        INNER JOIN (SELECT  desc_cod_da, nombre_da, gestion from estructura_organizacional
        WHERE  gestion =(SELECT CAST(${estructuraDto.gestion} AS INT)) GROUP BY desc_cod_da,nombre_da, gestion)  
        eo ON p.desc_cod_da_comision= eo.desc_cod_da
        LEFT JOIN ( SELECT id_persona, unnest(string_to_array(id_permiso::text, ','::text)) AS elemento FROM persona
        ) as per ON p.id_persona = per.id_persona
        WHERE per.elemento IN((SELECT CAST(83 AS TEXT)), (SELECT CAST(84 AS TEXT)) )
        AND p.gestion =${estructuraDto.gestion}
        GROUP BY p.id_usuario, p.id_persona, p.nombre , p.primer_apellido ,
        p.segundo_apellido ,
        pro.id_subtipo , pro.desc_subtipo , p.registro_profesional, 
        p.fecha_aprobacion, p.fecha_registro, eo.nombre_da , p.desc_cod_da_comision `; 
      const resultadoSgeo: any[] = await this.personaRepo.query(query);
      const resultadoSeguridad: any[] = resultadoUsuarios.data

      const resultado = resultadoSeguridad.map(seguridad => {
        const asignado = resultadoSgeo.filter(sgeo => sgeo.id_usuario === seguridad.idusuario);
        return { seguridad, sgeo: asignado };
      });

      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  //menu asignaciones general
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
    /*  const query = `      
      SELECT DISTINCT p.id_usuario, p.id_persona,  pa.id_subtipo as id_profesion, pa.desc_subtipo as profesion, p.registro_profesional, 
      p.fecha_aprobacion, p.fecha_registro, eo.nombre_da as nombre_da_comision, p.desc_cod_da_comision FROM persona as  p
      LEFT JOIN parametrica pa ON id_profesion = pa.id_subtipo 
      INNER JOIN estructura_organizacional eo ON p.desc_cod_da_comision= eo.desc_cod_da
      WHERE pa.id_tipo = 2 AND p.gestion =2024 `;*/

   const query = `      
      
SELECT  p.id_usuario, p.id_persona, p.nombre as pnombre, p.primer_apellido as pprimer_apellido, 
p.segundo_apellido as psegundo_apellido, 
pro.id_subtipo as id_profesion, pro.desc_subtipo as profesion, p.registro_profesional, 
p.fecha_aprobacion, p.fecha_registro, eo.nombre_da as nombre_da_comision, p.desc_cod_da_comision, p.id_permiso
FROM persona as  p
INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =2 )  as pro ON  p.id_profesion = pro.id_subtipo
INNER JOIN (SELECT  desc_cod_da, nombre_da, gestion from estructura_organizacional
WHERE  gestion =(SELECT CAST(${estructuraGralDto.gestion} AS INT)) GROUP BY desc_cod_da,nombre_da, gestion)  
eo ON p.desc_cod_da_comision= eo.desc_cod_da
LEFT JOIN ( SELECT id_persona, unnest(string_to_array(id_permiso::text, ','::text)) AS elemento FROM persona
) as per ON p.id_persona = per.id_persona
WHERE per.elemento NOT IN((SELECT CAST(83 AS TEXT)), (SELECT CAST(84 AS TEXT)) )
AND p.gestion =${estructuraGralDto.gestion}
GROUP BY p.id_usuario, p.id_persona, p.nombre , p.primer_apellido ,
p.segundo_apellido ,
pro.id_subtipo , pro.desc_subtipo , p.registro_profesional, 
p.fecha_aprobacion, p.fecha_registro, eo.nombre_da , p.desc_cod_da_comision `;   
//log(query)

      const resultadoSgeo: any[] = await this.personaRepo.query(query);
      const resultadoSeguridad: any[] = resultadoUsuarios.data

      const resultado = resultadoSeguridad.map(seguridad => {
        const asignado = resultadoSgeo.filter(sgeo => sgeo.id_usuario === seguridad.idusuario);
        return { seguridad, sgeo: asignado };
      });
      return this.responseService.success(resultado, "Listado Correctamente.")
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



  async persimosXPersona(id_persona: number) {
    try {
      const query =`SELECT  UNNEST(string_to_array(id_permiso::text, ','::text)) AS id_permiso_desglosado FROM persona
      WHERE id_persona = $1`;
      const values = [id_persona];
      console.log('values', values); 

      const resultado = await this.personaRepo.query(query, values);
      

      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  //personas solicitud designadas
  async listaPersonasDesignadas(data: RolDto) {
    try { 
      const { id_rol, gestion } = data;
      const pid_rol = id_rol.map((_, index) => `$${index + 1}`).join(',');
      const pgestion = `$${id_rol.length + 1}`;

      const query = `	 SELECT p.id_usuario, p.id_persona, p.nombre , p.primer_apellido ,
      p.segundo_apellido , 
	   pro.id_subtipo as id_profesion, pro.desc_subtipo as profesion, p.registro_profesional,
      p.fecha_aprobacion, p.fecha_registro, eo.nombre_da , p.desc_cod_da_comision, sd.id_persona	  
      FROM persona as  p
	  LEFT JOIN public.solicitud_designacion AS sd ON p.id_persona = sd.id_persona	
      INNER  JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =2 )  as pro ON  p.id_profesion = pro.id_subtipo
      INNER  JOIN (SELECT  desc_cod_da, nombre_da, gestion from estructura_organizacional		
      WHERE  gestion =${pgestion}  GROUP BY desc_cod_da,nombre_da, gestion)  
      eo ON p.desc_cod_da_comision= eo.desc_cod_da	 	   
      LEFT JOIN ( SELECT id_persona, unnest(string_to_array(id_permiso::text, ','::text)) AS elemento FROM persona
      ) as per ON p.id_persona = per.id_persona
     WHERE per.elemento  IN((SELECT CAST(${pid_rol} AS TEXT)) )
      AND p.gestion =${pgestion} AND sd.id_ficha=2
      GROUP BY p.id_usuario, p.id_persona, p.nombre , p.primer_apellido ,
      p.segundo_apellido ,       
      pro.id_subtipo , pro.desc_subtipo , p.registro_profesional, 
        p.fecha_aprobacion, p.fecha_registro, eo.nombre_da , p.desc_cod_da_comision,  sd.id_persona`;

      //const values = id_rol 
      const resultado: any[] = await this.personaRepo.query(query, [...id_rol, gestion]);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  


  //personas no designadas
  async listaPersonasNoDesignadas(data: RolDto) {
    try { 
      const { id_rol, gestion } = data;
      const pid_rol = id_rol.map((_, index) => `$${index + 1}`).join(',');
      const pgestion = `$${id_rol.length + 1}`;

      const query = `SELECT p.id_usuario, p.id_persona, p.nombre , p.primer_apellido ,
      p.segundo_apellido ,       
      p.fecha_aprobacion, p.fecha_registro, eo.nombre_da , p.desc_cod_da_comision
      FROM public.persona AS p
      INNER  JOIN (SELECT  desc_cod_da, nombre_da, gestion from estructura_organizacional		
      WHERE  gestion =${pgestion}  GROUP BY desc_cod_da,nombre_da, gestion)  
      eo ON p.desc_cod_da_comision= eo.desc_cod_da	 	   
      LEFT JOIN public.solicitud_designacion AS sd ON p.id_persona = sd.id_persona 	
      WHERE p.id_persona NOT IN (SELECT sd.id_persona
      FROM persona as  p
      LEFT JOIN public.solicitud_designacion AS sd ON p.id_persona = sd.id_persona	
      INNER  JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =2 )  as pro ON  p.id_profesion = pro.id_subtipo
      INNER  JOIN (SELECT  desc_cod_da, nombre_da, gestion from estructura_organizacional		
      WHERE  gestion =${pgestion}  GROUP BY desc_cod_da,nombre_da, gestion)  
      eo ON p.desc_cod_da_comision= eo.desc_cod_da	 	   
      LEFT JOIN ( SELECT id_persona, unnest(string_to_array(id_permiso::text, ','::text)) AS elemento FROM persona
      ) as per ON p.id_persona = per.id_persona
      WHERE per.elemento  IN((SELECT CAST(${pid_rol} AS TEXT)) )
      AND p.gestion =2024 AND sd.id_ficha=2
      GROUP BY sd.id_persona)`;

      //const values = id_rol 
      const resultado: any[] = await this.personaRepo.query(query, [...id_rol, gestion]);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  
}
