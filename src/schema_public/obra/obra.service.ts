import { Injectable } from '@nestjs/common';
import { CreateObraDto } from './dto/create-obra.dto';
import { UpdateObraDto } from './dto/update-obra.dto';
import { CarpetaDto } from './dto/carpetaDto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';

import { ResponseService } from 'src/response.service';
import { Obra } from './entities/obra.entity';
import { log } from 'console';
import { EstructuraObraDto } from './dto/estructuraDto.dto';
import { EstadoObraDto } from './dto/estado-obra.dto';
import { TipoObraModObraDto } from './dto/tipo-obra-modalidad.dto';
import { EstadoObraDesigDto } from '../designacion/dto/estado_obra_designacion.dto';
import { ObraIdDto } from './dto/obraDto.dto';

@Injectable()
export class ObraService {



  constructor(@InjectRepository(Obra) private obraRepositorio: Repository<Obra>,
    private responseService: ResponseService, 
  ) { }


  async create(createObraDto: CreateObraDto) {
    try {
      const resultado = await this.obraRepositorio.save(createObraDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
  }

 async findOne(id_obra: any) {    
    try {
      const resultado = await this.obraRepositorio.findOneBy({ id_obra });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

async  update(id: number, updateObraDto: UpdateObraDto) {
    try {
      const resultado = await this.obraRepositorio.update(id, updateObraDto)
      return this.responseService.success(id, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} obra`;
  }


async listarObrasXUe(estructuraDto: EstructuraObraDto) {
  try {

    const query = `SELECT * FROM public.obra as o
    INNER JOIN estructura_organizacional eo ON o.cod_ue =  eo.cod_ue
    WHERE o.cod_ue = $1 `;

    const values =[estructuraDto.cod_ue]
    const resultado = await this.obraRepositorio.query(query, values);
    return this.responseService.success(resultado, "Listado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }
}

  async listarObrasXEstado(data: EstadoObraDto) {
    try {
const query = ` SELECT DISTINCT o.id_obra, f.id_ficha,f.cod_carpeta, f.desc_cod_ue, f.desc_carpeta, f.fecha_validacion_carpeta,    
    REPLACE(to_char(f.total_carpeta,'999G999G999G999D99'), ' ', '') as total_carpeta,
    eo.desc_cod_da, eo.nombre_ue, eo.gestion,
    f.fecha_registro,  eg.desc_estado_gral,
    CASE WHEN d.estado_designacion IS NULL 
    THEN 1  
    ELSE d.estado_designacion 
    END AS estado_designacion,
    tob.desc_subtipo AS desc_tipoobra, 
mc.desc_subtipo AS desc_modalidad, d.fecha_modificacion 
     FROM obra AS o   
    INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
    INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
    WHERE  gestion =${data.gestion} GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
    INNER JOIN public.personapermiso_ue AS ppue ON eo.desc_cod_ue = ppue.desc_cod_ue
    INNER JOIN estado_general AS eg ON o.id_estado_general = eg.id_estado_general
    INNER JOIN public.persona_permiso AS pp ON ppue.id_persona_permiso = pp.id_persona_permiso  
    INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
    INNER JOIN persona AS p ON pp.id_persona = p.id_persona
LEFT OUTER JOIN designacion as d ON o.id_obra = d.id_obra   
  LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =3 )  as tob ON  o.id_tipo_obra = tob.id_subtipo
    LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =4 )  as mc ON  o.id_modalidad = mc.id_subtipo
    WHERE p.usuario = '${data.usuario}' AND (CASE WHEN d.estado_designacion IS NULL THEN 1  ELSE d.estado_designacion END) 
	IN(${data.id_estado_designacion}) AND pp.id_estado =1 AND ppue.id_estado=1` ;
    //const params = [ estadoObraDto.gestion, estadoObraDto.usuario, estadoObraDto.id_estado_designacion];  
   // log(query)
      const resultado = await this.obraRepositorio.query(query);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  actualizar(id_obra: number, tipoObraModDto: TipoObraModObraDto) {
    this.obraRepositorio.update(id_obra, tipoObraModDto);
    return {
      mensaje: 'Obra Actualizado con éxito',
      estado: true,
      data: id_obra
    }
  }

  async siExistePersonaMenos1y2(data: ObraIdDto): Promise<boolean> {
      const query = `SELECT d.id_obra FROM OBRA as o
      INNER JOIN designacion AS d ON o.id_obra = d.id_obra
      WHERE (d.id_persona = -1 OR d.id_persona =-2)  AND d.id_obra = ${data.id_obra};`;
    //  const params = [data.id_obra]   
      const siexiste = await this.obraRepositorio.query(query);
      log(siexiste);
      if(siexiste[0]){   return true; }
      else{  return false; }        
  }

 /* async token() {
    //const url = process.env.URL_SIM+'wsToken';
    const url = 'http://localhost:3009/auth/login';

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: 'pruebas2',
        password: 'oegs134679'
      }),
    };
    const response = await fetch(url, options);
    const resultado = await response.json();
    return resultado
  }*/

 /* async create(createObraDto: CreateObraDto) {
    try {  
      const v_token = await this.autenticacion.login(
        {"usuario": "pruebas2",
        "password": "oegs134679"}
      )
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${v_token}`,
        },
        body: JSON.stringify({
          createObraDto
        }),
      };
      const response = await fetch(url, options);        
      const resultado = await this.obraRepositorio.save(createObraDto);

      return this.responseService.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
*/

 /* async guardar(createObraDto: CreateObraDto) {
    //const v_token = await this.token();
    const url = 'http://localhost:3009/obra'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${v_token}`,
      },
      body: JSON.stringify({
        createObraDto
      }),

    };
    const response = await fetch(url, options);
    const resultado = await response.json();

  }
*/

}
