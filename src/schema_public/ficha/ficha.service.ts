import { ficha_itemService } from 'src/schema_sim/ficha_item/ficha_item.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { Connection } from 'typeorm';
import { Obra } from 'src/schema_public/obra/entities/obra.entity';

import { ResponseService } from 'src/response.service';
import { Ficha } from './entities/ficha.entity';
import { EstructuraFichaDto } from './dto/estructura-fichaDto';
//import { TipoObraModDto } from './dto/tipo-obra-modalidad.dto';

@Injectable()
export class FichaService {

  constructor(
    @InjectRepository(Ficha)
    private obraRepositorio: Repository<Ficha>,

    @InjectRepository(Obra)
    private obraRepository: Repository<Obra>,

    private responseService: ResponseService,

    private connection: Connection,
  ) { }

  async create(createFichaDto: CreateFichaDto) {
    try {
      const resultado = await this.obraRepositorio.save(createFichaDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async createFichaConObra(createFichaDto: CreateFichaDto) {
    try {
      return await this.connection.transaction(async (manager) => {

        //  Crear Ficha
        const ficha = manager.create(Ficha, createFichaDto);
        const fichaGuardada = await manager.save(ficha);

        // Crear Obra 
        const obra = manager.create(Obra, {
          id_ficha: fichaGuardada.id_ficha,
          id_estado_general: 1,
          usuario_registro: createFichaDto.usuario_registro,
          id_estado: 1,
          id_tipo_obra: 2
        });

        const obraGuardada = await manager.save(obra);

        return this.responseService.success(
          {
            ficha: fichaGuardada,
            obra: obraGuardada,
          },
          "Ficha y Obra registradas correctamente."
        );
      });

    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all ficha`;
  }

  async findOne(id: number) {
    try {
      const query = `SELECT *,   tob.desc_subtipo AS desc_tipoobra, mc.desc_subtipo AS desc_modalidad   FROM public.Ficha as f
    INNER JOIN (SELECT  desc_cod_ue, nombre_ue, gestion from estructura_organizacional WHERE  gestion =2024 GROUP BY desc_cod_ue,nombre_ue, gestion)  
    eo ON f.desc_cod_ue= eo.desc_cod_ue
    LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =3 )  as tob ON  f.id_tipo_obra = tob.id_subtipo
    LEFT JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica  WHERE id_tipo =4 )  as mc ON  f.id_modalidad = mc.id_subtipo
    WHERE f.id_ficha = ${id}  `;
      const resultado = await this.obraRepositorio.query(query);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  async update(id: number, updateFichaDto: UpdateFichaDto) {
    try {
      const resultado = await this.obraRepositorio.update(id, updateFichaDto)
      return this.responseService.success(id, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} ficha`;
  }


  async listarFichaXUe(estructuraFichaDto: EstructuraFichaDto) {
    try {

      const query = ` SELECT f.id_ficha,f.cod_carpeta, f.desc_cod_ue, f.desc_carpeta, f.fecha_validacion_carpeta, 
public.formato_numerico(f.total_carpeta, 2)  as total_carpeta,
   eo.desc_cod_da, eo.nombre_ue, eo.gestion,
   f.fecha_registro
   FROM public.Ficha as f
         INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
         WHERE  gestion =${estructuraFichaDto.gestion} GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
         INNER JOIN  solicitud_designacion sd ON f.id_ficha = sd.id_ficha
         INNER JOIN persona p ON sd.id_persona = p.id_persona	
   GROUP BY f.id_ficha, f.cod_carpeta, f.desc_cod_ue, f.desc_carpeta, f.fecha_validacion_carpeta, f.total_carpeta,  eo.desc_cod_da, eo.nombre_ue, eo.gestion	  
   ORDER BY f.fecha_registro DESC;`;
      const resultado = await this.obraRepositorio.query(query);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listarFichaXUeValidadas(estructuraFichaDto: EstructuraFichaDto) {
    try {
      /* const query = `SELECT * FROM public.Ficha as f
       INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue, gestion from estructura_organizacional
       WHERE  gestion =${estructuraFichaDto.gestion} GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
       WHERE  f.id_ficha NOT IN(
       SELECT f.id_ficha FROM public.Ficha as f
       INNER JOIN  solicitud_designacion sd ON f.id_ficha = sd.id_ficha)
       ORDER BY fecha_registro ASC `;*/

      const query = ` SELECT f.id_ficha,f.cod_carpeta, f.desc_cod_ue, f.desc_carpeta, f.fecha_validacion_carpeta,    
      REPLACE(to_char(f.total_carpeta,'999G999G999G999D99'), ' ', '') as total_carpeta,
      eo.desc_cod_da, eo.nombre_ue, eo.gestion,
      f.fecha_registro  FROM public.Ficha as f
            INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue, gestion from estructura_organizacional
            WHERE  gestion =${estructuraFichaDto.gestion} GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
            WHERE  f.id_ficha NOT IN(
            SELECT f.id_ficha FROM public.obra as f
            INNER JOIN  designacion sd ON f.id_obra = sd.id_obra)
            ORDER BY fecha_registro ASC`;

      const resultado = await this.obraRepositorio.query(query);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listado(id_carpeta?: number): Promise<any> {
    console.log("id_carpeta", id_carpeta);

    let q = `SELECT * FROM vista_ficha WHERE 1=1 `;
    var res: any;
    if (id_carpeta != null && id_carpeta > 0) {
      q = q + ` AND cod_carpeta = $1`;
      var res = await this.obraRepositorio.query(q, [id_carpeta]);
    }
    else {
      res = await this.obraRepositorio.query(q);
    }

    //mensaje en caso de no encontrar registros
    if (!res || res.length === 0) {
      throw new NotFoundException('No se encontraron registros con la carpeta especificada.');
    }
    return res;
  }

  async listadoResumen(): Promise<any> {

    let q = `SELECT * FROM vista_ficha_resumen WHERE 1=1 `;
    console.log(q);

    var res: any;
    res = await this.obraRepositorio.query(q);
    // if (id_carpeta!=null && id_carpeta > 0) {
    //   q = q + ` AND cod_carpeta = $1`;
    //   var res = await this.obraRepositorio.query(q, [id_carpeta]);
    // }
    // else {
    //   res = await this.obraRepositorio.query(q);
    // }

    //mensaje en caso de no encontrar registros
    if (!res || res.length === 0) {
      throw new NotFoundException('No se encontraron registros con la carpeta especificada.');
    }
    return res;
  }
}
