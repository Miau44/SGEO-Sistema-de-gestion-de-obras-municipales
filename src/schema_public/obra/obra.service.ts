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
import { ObraSolicitudesDto } from './dto/obra-solicitudes.dto';
import { MisProyectoDto } from './dto/mis-proyectos.dto';

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
 const query = `

 SELECT DISTINCT o.id_obra, f.id_ficha,f.cod_carpeta, f.desc_cod_ue, f.desc_carpeta, 
 f.fecha_validacion_carpeta,    
REPLACE(to_char(f.total_carpeta,'999G999G999G999D99'), ' ', '') as total_carpeta,
eo.desc_cod_da, eo.nombre_ue, eo.gestion,
f.fecha_registro,  
tob.desc_subtipo AS desc_tipoobra , eg.desc_subestado as estado, f.desc_zona_carpeta, o.procede
 FROM public.obra AS o   
INNER JOIN public.ficha f  ON o.id_ficha = f.id_ficha
INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from public.estructura_organizacional
WHERE  gestion =2024 GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =3 )  as tob ON  o.id_tipo_obra = tob.id_subtipo
INNER JOIN public.estado_general as eg ON  o.id_estado = eg.id_estado_general      
     WHERE  o.id_obra = ${id_obra}`;
     const resultado = await this.obraRepositorio.query(query);

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
/*const query = ` SELECT DISTINCT o.id_obra, f.id_ficha,  d.id_designacion, f.cod_carpeta,  f.desc_cod_ue, f.desc_carpeta, f.fecha_validacion_carpeta,    
    REPLACE(to_char(f.total_carpeta,'999G999G999G999D99'), ' ', '') as total_carpeta,
    f.total_carpeta as totalcarpeta,
    eo.desc_cod_da, eo.nombre_ue, eo.gestion,
    f.fecha_registro,  eg.desc_estado_gral,
    CASE WHEN d.estado_designacion IS NULL 
    THEN 1  
    ELSE d.estado_designacion 
    END AS estado_designacion,
    tob.desc_subtipo AS desc_tipoobra, 
mc.desc_subtipo AS desc_modalidad, d.fecha_modificacion,
(CASE  WHEN oem.codigo IS NULL THEN 0  ELSE 1 END) AS es_ema 
     FROM obra AS o   
    INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
    INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
    WHERE  gestion =${data.gestion} GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
    INNER JOIN public.personapermiso_ue AS ppue ON eo.desc_cod_ue = ppue.desc_cod_ue
    INNER JOIN estado_general AS eg ON o.id_estado_general = eg.id_estado_general
    INNER JOIN public.persona_permiso AS pp ON ppue.id_persona_permiso = pp.id_persona_permiso  
    INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
    INNER JOIN persona AS p ON pp.id_persona = p.id_persona
LEFT JOIN public.sp_obras_ema() AS oem  ON o.id_obra = oem.id_obra	    
LEFT OUTER JOIN designacion as d ON o.id_obra = d.id_obra   
  LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =3 )  as tob ON  o.id_tipo_obra = tob.id_subtipo
    LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =4 )  as mc ON  o.id_modalidad = mc.id_subtipo
    WHERE p.usuario = '${data.usuario}' AND (CASE WHEN d.estado_designacion IS NULL THEN 1  ELSE d.estado_designacion END) 
	IN(${data.id_estado_designacion}) AND pp.id_estado =1 AND ppue.id_estado=1` ;*/


/* let query:any = ` SELECT DISTINCT o.id_obra, f.id_ficha,   f.cod_carpeta,  f.desc_cod_ue, f.desc_carpeta, 
f.fecha_validacion_carpeta,    
    REPLACE(to_char(f.total_carpeta,'999G999G999G999D99'), ' ', '') as total_carpeta,
    f.total_carpeta as totalcarpeta,
    eo.desc_cod_da, eo.nombre_ue, eo.gestion,
    f.fecha_registro,  eg.desc_subestado as desc_estado_gral,    
    tob.desc_subtipo AS desc_tipoobra, 
mc.desc_subtipo AS desc_modalidad, 
(CASE  WHEN oem.codigo IS NULL THEN 0  ELSE 1 END) AS es_ema, 
  '0' as estado_designacion, f.fecha_validacion_carpeta as  fecha_modificacion
     FROM obra AS o   
    INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
    INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
    WHERE  gestion =$1  GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
    INNER JOIN public.personapermiso_ue AS ppue ON eo.desc_cod_ue = ppue.desc_cod_ue
    INNER JOIN estado_general AS eg ON o.id_estado_general = eg.id_estado_general
    INNER JOIN public.persona_permiso AS pp ON ppue.id_persona_permiso = pp.id_persona_permiso  
    INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
    INNER JOIN persona AS p ON pp.id_persona = p.id_persona
LEFT JOIN public.sp_obras_ema() AS oem  ON o.id_obra = oem.id_obra	
    INNER JOIN solicitud AS s ON o.id_obra = s.id_obra  
  LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =3 )  as tob ON  o.id_tipo_obra = tob.id_subtipo
    LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =4 )  as mc ON  o.id_modalidad = mc.id_subtipo
    WHERE p.usuario = $2  
	 AND pp.id_estado =1 AND ppue.id_estado=1  ` ;*/

   let query:any = ` SELECT DISTINCT o.id_obra, f.id_ficha,   f.cod_carpeta,  f.desc_cod_ue, f.desc_carpeta, 
f.fecha_validacion_carpeta, REPLACE(to_char(f.total_carpeta,'999G999G999G999D99'), ' ', '') as total_carpeta,
f.total_carpeta as totalcarpeta,eo.desc_cod_da, eo.nombre_ue, eo.gestion,
f.fecha_registro,  eg.desc_subestado as desc_estado_gral, tob.desc_subtipo AS desc_tipoobra, 
mc.desc_subtipo AS desc_modalidad, (CASE  WHEN oem.codigo IS NULL THEN 0  ELSE 1 END) AS es_ema, 
'0' as estado_designacion, f.fecha_validacion_carpeta as  fecha_modificacion
FROM obra AS o   
INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
WHERE  gestion =$1 GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
INNER JOIN public.personapermiso_ue AS ppue ON eo.desc_cod_ue = ppue.desc_cod_ue
INNER JOIN estado_general AS eg ON o.id_estado_general = eg.id_estado_general
INNER JOIN public.persona_permiso AS pp ON ppue.id_persona_permiso = pp.id_persona_permiso  
INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
INNER JOIN persona AS p ON pp.id_persona = p.id_persona	
LEFT JOIN public.sp_obras_ema() AS oem  ON o.id_obra = oem.id_obra	     
LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =3 )  as tob ON  o.id_tipo_obra = tob.id_subtipo
LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =4 )  as mc ON  o.id_modalidad = mc.id_subtipo
WHERE p.usuario = $2  AND pp.id_estado =1 AND ppue.id_estado=1 
` ;

// Condiciones adicionales seg?n el DTO
if (data.validada) {
  query += ` AND o.id_obra NOT IN(SELECT id_obra FROM solicitud WHERE  id_estado_general IN (10,11) GROUP BY id_obra HAVING COUNT(DISTINCT id_estado_general) = 2) `;
}

if (data.designada) {
  query += ` AND o.id_obra IN (SELECT id_obra FROM solicitud WHERE  id_estado_general IN (10,11) GROUP BY id_obra )`;
 
}

   const queryParams = [data.gestion, data.usuario]; 
      const resultado = await this.obraRepositorio.query(query, queryParams);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listarObrasXSolicitudes(data: ObraSolicitudesDto) {
    try {
const query = ` SELECT  o.id_obra, f.id_ficha,  f.cod_carpeta,  f.desc_cod_ue, f.desc_carpeta, f.fecha_validacion_carpeta,    
    REPLACE(to_char(f.total_carpeta,'999G999G999G999D99'), ' ', '') as total_carpeta,
    eo.desc_cod_da, eo.nombre_ue, eo.gestion,
    f.fecha_registro,  eg.desc_subestado as desc_estado_gral,
    tob.desc_subtipo AS desc_tipoobra, 
mc.desc_subtipo AS desc_modalidad, 
(CASE  WHEN oem.codigo IS NULL THEN 0  ELSE 1 END) AS es_ema , sol.solicitud
     FROM obra AS o   
    INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
    INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
    WHERE  gestion =2024 GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
    INNER JOIN estado_general AS eg ON o.id_estado_general = eg.id_estado_general
	INNER JOIN  public.sp_solicitudes_x_obra() AS sol ON o.id_obra = sol.idobra
	LEFT JOIN public.sp_obras_ema() AS oem  ON o.id_obra = oem.id_obra
  LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =3 )  as tob ON  o.id_tipo_obra = tob.id_subtipo
    LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =4 )  as mc ON  o.id_modalidad = mc.id_subtipo
WHERE sol.idusuario= ${data.usuario} ` ;
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
      mensaje: 'Obra Actualizado con �xito',
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

  async actualizarEstadoSicom(id_obra: number, id_estado_sicom: number): Promise<Obra| null> {
    await this.obraRepositorio.update(id_obra, { id_estado_sicom });
    return this.obraRepositorio.findOneBy({ id_obra }); // Retorna el registro actualizado
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


  async listaMisProyectos(misproyectos: MisProyectoDto) {
    try {
//fiscal y supervisor
      if (misproyectos.permiso === 3 || misproyectos.permiso === 14 ) {
        const query = `SELECT DISTINCT o.id_obra, f.id_ficha,   f.cod_carpeta,  f.desc_cod_ue, f.desc_carpeta, 
        f.fecha_validacion_carpeta, REPLACE(to_char(f.total_carpeta,'999G999G999G999D99'), ' ', '') as total_carpeta,
        f.total_carpeta as totalcarpeta,eo.desc_cod_da, eo.nombre_ue, eo.gestion,
        f.fecha_registro,  eg.desc_subestado as desc_estado_gral, tob.desc_subtipo AS desc_tipoobra, 
        mc.desc_subtipo AS desc_modalidad, (CASE  WHEN oem.codigo IS NULL THEN 0  ELSE 1 END) AS es_ema, 
        '0' as estado_designacion, f.fecha_validacion_carpeta as  fecha_modificacion
        FROM obra AS o   
        INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
        INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
        WHERE  gestion =$1 GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
        INNER JOIN estado_general AS eg ON o.id_estado_general = eg.id_estado_general
        INNER JOIN designacion AS d ON o.id_obra = d.id_obra
        INNER JOIN persona AS p ON d.id_persona = p.id_persona	
        LEFT JOIN public.sp_obras_ema() AS oem  ON o.id_obra = oem.id_obra	     
        LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =3 )  as tob ON  o.id_tipo_obra = tob.id_subtipo
        LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =4 )  as mc ON  o.id_modalidad = mc.id_subtipo
        WHERE p.id_usuario =$2   AND p.id_estado=5 AND d.id_estado =1 AND estado_designacion =99 `;

        const values = [misproyectos.gestion, misproyectos.id_usuario]
        const resultado = await this.obraRepositorio.query(query, values);
        return this.responseService.success(resultado, "Listado Correctamente.")

      }
      else {

        const query = `SELECT DISTINCT o.id_obra, f.id_ficha,   f.cod_carpeta,  f.desc_cod_ue, f.desc_carpeta, 
        f.fecha_validacion_carpeta, REPLACE(to_char(f.total_carpeta,'999G999G999G999D99'), ' ', '') as total_carpeta,
        f.total_carpeta as totalcarpeta,eo.desc_cod_da, eo.nombre_ue, eo.gestion,
        f.fecha_registro,  eg.desc_subestado as desc_estado_gral, tob.desc_subtipo AS desc_tipoobra, 
        mc.desc_subtipo AS desc_modalidad, (CASE  WHEN oem.codigo IS NULL THEN 0  ELSE 1 END) AS es_ema, 
        '0' as estado_designacion, f.fecha_validacion_carpeta as  fecha_modificacion
        FROM obra AS o   
        INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
        INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
        WHERE  gestion =$1  GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
        INNER JOIN public.personapermiso_ue AS ppue ON eo.desc_cod_ue = ppue.desc_cod_ue
        INNER JOIN estado_general AS eg ON o.id_estado_general = eg.id_estado_general
        INNER JOIN public.persona_permiso AS pp ON ppue.id_persona_permiso = pp.id_persona_permiso  
        INNER JOIN (SELECT id_subtipo as id_permiso, desc_subtipo FROM parametrica WHERE id_tipo=7) AS per ON pp.id_permiso = per.id_permiso
        INNER JOIN persona AS p ON pp.id_persona = p.id_persona	
        LEFT JOIN public.sp_obras_ema() AS oem  ON o.id_obra = oem.id_obra	     
        LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =3 )  as tob ON  o.id_tipo_obra = tob.id_subtipo
        LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =4 )  as mc ON  o.id_modalidad = mc.id_subtipo
        WHERE p.id_usuario =$2  AND pp.id_estado =1 AND ppue.id_estado=1 `;

        const values = [misproyectos.gestion, misproyectos.id_usuario]
        const resultado = await this.obraRepositorio.query(query, values);
        return this.responseService.success(resultado, "Listado Correctamente.")
      }
    } catch (error) {
      return this.responseService.error(error);
    }
  }

}
