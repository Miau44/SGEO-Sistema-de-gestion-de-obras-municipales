import { Injectable } from '@nestjs/common';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { Informe } from './entities/informe.entity';
import { ResponseService } from 'src/response.service';
import { ListaInformeDto } from './dto/lista-informe.dto';
import { InformeInicial } from './entities/informe_inicial.entity';
import { CreateInformeInicialDto } from './dto/create-informe-inicial.dto';
import { UpdateInformeInicialDto } from './dto/update-informe-inicial.dto';
import { InformeObraDto } from './dto/informe-obra.dto';
import { InformeOpcionDto } from './dto/informe-opcion.dto';



@Injectable()
export class InformeService {

  constructor(
    @InjectRepository(Informe) private informeRepositorio: Repository<Informe>,
    private responseService: ResponseService,
    @InjectRepository(InformeInicial) private infInicialRepositorio: Repository<InformeInicial>,
  ) { }

  async create(createInformeDto: CreateInformeDto) {
    try {
      const resultado = await this.informeRepositorio.save(createInformeDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async findAll() {
    try {
      const resultado = await this.informeRepositorio.find()
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }



  async findOne(id_informe: number) {
    try {
      const resultado = await this.informeRepositorio.findOneBy({ id_informe });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  update(id: number, updateInformeDto: UpdateInformeDto) {
    try {
      return this.informeRepositorio.update(+id, updateInformeDto);
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} informeInicial`;
  }


  async listaInformeInicial(data: ListaInformeDto) {
    try {
      let query;
      if (data.padre === 0) {

      /*  query = ` SELECT p.*,   CASE WHEN ii.id_subtipo > 0 THEN 1 
        WHEN p.id_subtipo = 220 THEN 1 ELSE 0 END AS validar   FROM  parametrica AS p
        LEFT OUTER JOIN  public.informe_inicial AS ii ON p.id_subtipo =ii.id_subtipo WHERE id_tipo = 21 AND id_padre = $1
        ORDER BY p.id_subtipo; `;*/



       query = ` SELECT pp.id_tipo, pp.id_subtipo, pp.desc_subtipo, CASE WHEN c.validar = 1 THEN 1 ELSE 0 END as validar
        FROM parametrica AS pp
        LEFT OUTER JOIN (
        SELECT p.*,   CASE WHEN ii.id_subtipo > 0 THEN 1 
        WHEN p.id_subtipo = 220 THEN 2 ELSE 0 END AS validar   FROM  parametrica AS p
        LEFT OUTER JOIN  public.informe_inicial AS ii ON p.id_subtipo =ii.id_subtipo 
        WHERE id_tipo = 21 AND id_padre = 0  AND ii.id_informe =$2
        ORDER BY p.id_subtipo) as c ON  pp.id = c.id
        WHERE pp.id_tipo = 21 AND pp.id_padre = $1; `;

      }
      else {       
     /*   query = `
    SELECT de.id, ijson.id_informe_inicial, pa.id_subtipo as padre_id_subtipo, pa.desc_subtipo as padre_desc_subtipo 
      , de.id_subtipo, de.desc_subtipo ,  ijson.opcion, ijson.observaciones FROM parametrica as pa 
      INNER JOIN (SELECT * FROM  parametrica WHERE id_tipo=21 
      AND id_padre IN(SELECT id_padre FROM  parametrica WHERE id_tipo=21 AND id_padre =$1)) as de 	
      ON pa.id_subtipo = de.id_padre
    LEFT OUTER JOIN (SELECT id_informe_inicial,    
      (f.x ->> 'id_subtipo')::integer AS idsubtipo,
      (f.x ->> 'opcion')::integer AS opcion,
      f.x ->> 'observaciones' AS observaciones FROM  informe_inicial AS it, 
      jsonb_array_elements(descripcion::jsonb) AS f(x)) AS ijson   ON de.id_subtipo = ijson.idsubtipo; `;*/

query = `
      SELECT de.id, ijson.id_informe_inicial, pa.id_subtipo as padre_id_subtipo, pa.desc_subtipo as padre_desc_subtipo 
      , de.id_subtipo, de.desc_subtipo ,  ijson.opcion, ijson.observaciones,  
      CASE WHEN ijson.cumple IS NULL THEN 0 ELSE ijson.cumple END AS cumple FROM parametrica as pa 
      INNER JOIN (SELECT * FROM  parametrica WHERE id_tipo=21 
      AND id_padre IN(SELECT id_padre FROM  parametrica WHERE id_tipo=21 AND id_padre =$1)) as de 	
      ON pa.id_subtipo = de.id_padre
      LEFT OUTER JOIN (SELECT t2.id_informe_inicial,t2.id_padre, t2.idsubtipo, t2.opcion, t2.observaciones, t1.obs as cumple 
      FROM public.sp_opcion_informeinicial() AS t1
      RIGHT OUTER JOIN  (
      SELECT id_informe_inicial, id_subtipo as id_padre,   
      (f.x ->> 'id_subtipo')::integer AS idsubtipo,
      (f.x ->> 'opcion')::integer AS opcion,
      f.x ->> 'observaciones' AS observaciones FROM  informe_inicial AS it, 
      jsonb_array_elements(descripcion::jsonb) AS f(x) WHERE id_informe =$2 ) AS t2
      ON t1.idsubtipo = t2.opcion AND t1.idpadre = t2.id_padre ) AS ijson   ON de.id_subtipo = ijson.idsubtipo; `;   }
      const params = [data.padre, data.informe];
      const resultado: any[] = await this.informeRepositorio.query(query, params);

      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

//informe Inicial
  async createInformeInicial(createInformeInicialDto: CreateInformeInicialDto) {
    try {
      const resultado = await this.infInicialRepositorio.save(createInformeInicialDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  updateInformeInicial(id: number, updateInformeInicialDto: UpdateInformeInicialDto) {
    try {
      return this.infInicialRepositorio.update(+id, updateInformeInicialDto);
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  /* async siExisteInforme(data: InformeObraDto): Promise<boolean> {
     const query = `	SELECT i.id_informe FROM public.informe AS i
   INNER JOIN obra AS  o  ON i.id_obra = o.id_obra
   WHERE  i.id_obra = $1 AND  i.id_estado =1;`;
     const params = [data.obra]
     const siexiste = await this.informeRepositorio.query(query, params);
     console.log(siexiste);
     if (siexiste[0]) { return true; }
     else { return false; }
   }*/



  async siExisteInforme(data: InformeObraDto) {
    try {
      const query = ` SELECT i.id_informe FROM public.informe AS i
      LEFT OUTER JOIN obra AS  o  ON i.id_obra = o.id_obra
      WHERE  i.id_obra = $1 AND  i.id_estado =1;`;
      const params = [data.obra];
      const resultado = await this.informeRepositorio.query(query,params);
      return this.responseService.success(resultado, "Listado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async listaOpcionesInforme(data:InformeOpcionDto ) {
    try {

      if (data.subtipo === 169  || data.subtipo === 170 ) {
        const query = ` SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo =25 AND id_estado=1;`;
       
        const resultado = await this.informeRepositorio.query(query, );

        return this.responseService.success(resultado, "Listado Correctamente.")

      }
      else {
        const query = `SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo =25 AND id_estado=1 AND id_subtipo NOT IN (218);`;
        const resultado = await this.informeRepositorio.query(query);
        return this.responseService.success(resultado, "Listado Correctamente.")
      }
    } catch (error) {
      return this.responseService.error(error);
    }
  }        


}
