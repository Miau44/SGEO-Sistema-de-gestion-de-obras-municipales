import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
import { InformeActividadesDto } from './dto/informe-actividades.dto';



@Injectable()
export class InformeService {

  constructor(
    @InjectRepository(Informe) private informeRepositorio: Repository<Informe>,
    private responseService: ResponseService,
    @InjectRepository(InformeInicial) private infInicialRepositorio: Repository<InformeInicial>,
  ) { }

  async create(createInformeDto: CreateInformeDto) {
    try {
      // Guardar directamente el array de objetos JSON en la base de datos
      const resultado = await this.informeRepositorio.save({
        ...createInformeDto,
        id_documento: createInformeDto.id_documento, // No necesitas transformarlo
      });

      return this.responseService.success(resultado, "Registrado Correctamente.");
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

  async update(id: number, updateInformeDto: UpdateInformeDto) {
    try {
        const updateData: any = { ...updateInformeDto };

        // 🔹 Si `id_documento` es un array, lo convertimos a JSON
        if (Array.isArray(updateData.id_documento)) {
            updateData.id_documento = JSON.stringify(updateData.id_documento);
        }

        const resultado = await this.informeRepositorio.update(id, updateData);
        return this.responseService.success(resultado, "Actualizado Correctamente.");
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
      
       /*     query = ` SELECT pp.id_tipo, pp.id_subtipo, pp.desc_subtipo, CASE WHEN c.validar = 1 THEN 1 
       WHEN pp.id_subtipo IN(220,172) THEN 2 ELSE 0 END as validar
        FROM parametrica AS pp
        LEFT OUTER JOIN (
        SELECT p.*,   CASE WHEN ii.id_subtipo > 0 THEN 1 
        WHEN p.id_subtipo = 220 THEN 2 ELSE 0 END AS validar   FROM  parametrica AS p
        LEFT OUTER JOIN  public.informe_inicial AS ii ON p.id_subtipo =ii.id_subtipo 
        WHERE id_tipo = 21 AND id_padre = 0  AND ii.id_informe =$2
        ORDER BY p.id_subtipo) as c ON  pp.id = c.id
        WHERE pp.id_tipo = 21 AND pp.id_padre = $1; `;*/

      query = `SELECT pp.id_tipo, pp.id_subtipo, pp.desc_subtipo, 
      CASE 
      WHEN c.validar = 1 THEN 1 
      WHEN pp.id_subtipo = 220 THEN 2 
      ELSE 0 
      END AS validar
      FROM parametrica AS pp
      LEFT OUTER JOIN (
      SELECT sub.id_subtipo, sub.desc_subtipo, sub.validar
      FROM (SELECT ii.id_subtipo, p.desc_subtipo,  
          CASE 
              WHEN ii.id_subtipo > 0 THEN 1
              WHEN p.id_subtipo = 220 THEN 2 
              ELSE 0 END AS validar
      FROM parametrica AS p
      LEFT OUTER JOIN public.informe_inicial AS ii ON p.id_subtipo = ii.id_subtipo
      WHERE p.id_tipo = 21 AND p.id_padre = 0 AND ii.id_informe = $2         
      UNION ALL         
      SELECT 172 AS id_subtipo, NULL AS desc_subtipo, 
          CASE WHEN obs_general IS NULL OR TRIM(obs_general) = '' THEN 0
              ELSE 1 END AS validar
      FROM public.informe 
      WHERE id_informe = $2) AS sub
      ) AS c ON pp.id_subtipo = c.id_subtipo
      WHERE pp.id_tipo = 21 AND pp.id_padre = $1
      ORDER BY pp.id_subtipo ASC;; `;
      }
      else {


        query = `
      SELECT de.id, ijson.id_informe_inicial, pa.id_subtipo as padre_id_subtipo, pa.desc_subtipo as padre_desc_subtipo 
      , de.id_subtipo, de.desc_subtipo , de.detalle, ijson.opcion, ijson.observaciones,  
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
      ON t1.idsubtipo = t2.opcion AND t1.idpadre = t2.id_padre ) AS ijson   ON de.id_subtipo = ijson.idsubtipo; `;
      }
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

  async siExisteInforme(data: InformeObraDto) {
    try {
      const query = ` SELECT i.id_informe FROM public.informe AS i
      LEFT OUTER JOIN obra AS  o  ON i.id_obra = o.id_obra
      WHERE  i.id_obra = $1 AND  id_tipo_informe=$2 AND i.id_estado =1;`;
      const params = [data.obra, data.tipo_informe];
      const resultado = await this.informeRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async listaOpcionesInforme(data:InformeOpcionDto ) {
    try {

      /*if (data.subtipo === 169  || data.subtipo === 170 ) {
        const query = ` SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo =25 AND id_estado=1;`;
       
        const resultado = await this.informeRepositorio.query(query, );

        return this.responseService.success(resultado, "Listado Correctamente.")

      }
      else {
        const query = `SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo =25 AND id_estado=1 AND id_subtipo NOT IN (218);`;
        const resultado = await this.informeRepositorio.query(query);
        return this.responseService.success(resultado, "Listado Correctamente.")
      }*/

        const query = ` SELECT  idpadre AS id_padre,  idsubtipo AS id_subtipo, descsubtipo AS desc_subtipo, obs AS observacion
        FROM sp_opcion_informeinicial() WHERE idpadre =$1`;
        const params = [data.subtipo];
        const resultado = await this.informeRepositorio.query(query, params);
        return this.responseService.success(resultado, "Listado Correctamente.")        

    } catch (error) {
      return this.responseService.error(error);
    }
  }        


  async listaInformeActividades(data: InformeActividadesDto) {
    try {

      const query = `  SELECT de.id, ijson.id_informe_inicial, pa.id_subtipo as padre_id_subtipo, pa.desc_subtipo as padre_desc_subtipo 
  , de.id_subtipo, de.desc_subtipo ,  ijson.opcion, ijson.observaciones,
CASE 
WHEN ijson.id_informe_inicial > 0 THEN 1
ELSE 0 END AS validar  
  FROM parametrica as pa 
  INNER JOIN (SELECT * FROM  parametrica WHERE id_tipo=28 
  AND id_padre IN(SELECT id_padre FROM  parametrica WHERE id_tipo=28 AND id_padre IN(228,227))) as de 	
  ON pa.id_subtipo = de.id_padre
LEFT OUTER JOIN (SELECT id_informe_inicial,    
  (f.x ->> 'id_subtipo')::integer AS idsubtipo,
  (f.x ->> 'opcion')::integer AS opcion,
  f.x ->> 'observaciones' AS observaciones FROM  informe_inicial AS it, 
  jsonb_array_elements(descripcion::jsonb) AS f(x) WHERE id_informe =$1 ) AS ijson   ON de.id_subtipo = ijson.idsubtipo
ORDER BY pa.id_subtipo;`;
      const params = [data.informe];
      const resultado = await this.informeRepositorio.query(query, params);

      return this.responseService.success(resultado, "Listado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }



  async listaEmitirOrden() {
    try {

      const query = ` SELECT CASE WHEN id_subtipo =197  THEN 0 ELSE 1 END AS orden_proceder, id_subtipo,
desc_subtipo FROM parametrica WHERE id_padre =173		`;
 
      const resultado = await this.informeRepositorio.query(query);

      return this.responseService.success(resultado, "Listado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async updateInformeDocumentos(id_informe: number, id_documentos: number[]): Promise<any> {
    // Buscar el informe
    const informe = await this.informeRepositorio.findOne({
        where: { id_informe },
    });

    if (!informe) {
        throw new HttpException('El informe no existe.', HttpStatus.NOT_FOUND);
    }

    // Crear el array de objetos JSON con los id_documentos
    const documentosJson = id_documentos.map((id) => ({ id_documento: id }));

    // Guardar directamente el array JSON en el campo de la base de datos
    informe.id_documento = documentosJson as any;

    await this.informeRepositorio.save(informe);

    return {
        message: 'El campo id_documento fue actualizado correctamente.',
        id_informe,
        documentos: documentosJson,
    };
}

}
