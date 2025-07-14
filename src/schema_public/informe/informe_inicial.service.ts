import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, DataSource, Not, Repository } from 'typeorm';
import { Informe } from './entities/informe.entity';
import { ResponseService } from 'src/response.service';
import { ListaInformeDto } from './dto/lista-informe.dto';
import { InformeInicial } from './entities/informe_inicial.entity';
import { CreateInformeInicialDto } from './dto/create-informe-inicial.dto';
import { UpdateInformeInicialDto } from './dto/update-informe-inicial.dto';
import { InformeObraDto } from './dto/informe-obra.dto';
import { InformeOpcionDto } from './dto/informe-opcion.dto';
import { InformeActividadesDto } from './dto/informe-actividades.dto';
import { Documento } from '../documento/entities/documento.entity';
import { CreateInformeNuevoDto } from './dto/informe-nuevo.dto';
import { SolicitudService } from '../solicitud/solicitud.service';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { CreateInformeObraDto } from './dto/create-informe-obra.dto';
import { CreateSolicitudDto } from '../solicitud/dto/create-solicitud.dto';
import { ListaInformeObraDto } from './dto/listar_informe_obra.dto';
import { UpdateInformeObraDto } from './dto/update-informe-obra.dto';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { BuscarTipoInformeDto } from './dto/buscar-informe.dto';
import { CreateActaEntregaProvicionalDto } from './dto/create-acta-entrega-provicional.dto';
import { UpdateActaEntregaProvDto } from './dto/update-acta-entega-prov.dto';
import { InformeObraSolicitudDto } from './dto/informe-obra-solicitud.dto';



@Injectable()
export class InformeService {

  constructor(
    @InjectRepository(Informe) private informeRepositorio: Repository<Informe>,
    @InjectRepository(Solicitud) private solicitudRepositorio: Repository<Solicitud>,
    private responseService: ResponseService,
    @InjectRepository(InformeInicial) private infInicialRepositorio: Repository<InformeInicial>,
    private readonly dataSource: DataSource,
    @InjectRepository(Documento) private documentoRepositorio: Repository<Documento>,
    private solicitudService: SolicitudService,
    private servicioCorrelativo: CorrelativoService, 
    private readonly correlativoService: CorrelativoService,

  ) { }

   /* async create(createInformeDto: CreateInformeDto) {
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
    }*/
  

  async create(createInformeDto: CreateInformeDto) {
    try {
      
      const existe = await this.informeRepositorio.findOne({
        where: {
          id_obra: createInformeDto.id_obra,
          id_tipo_informe: createInformeDto.id_tipo_informe,
          id_solicitud: createInformeDto.id_solicitud,
        }
      });

      if (existe) {
        return this.responseService.success(null, "Ya existe un informe con id_subtipo 227 para este id_informe.");

      }
    /*  // Guardar si no existe duplicado
      const resultado = await this.informeRepositorio.save({
        ...createInformeDto,
      });*/

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
      ORDER BY pp.id_subtipo ASC; `;
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
      ON t1.idsubtipo = t2.opcion AND t1.idpadre = t2.id_padre ) AS ijson   ON de.id_subtipo = ijson.idsubtipo    ORDER BY de.id_subtipo ASC `;
      }
      const params = [data.padre, data.informe];
      const resultado: any[] = await this.informeRepositorio.query(query, params);

      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

//informe Inicial
 /* async createInformeInicial(createInformeInicialDto: CreateInformeInicialDto) {
    try {
      const resultado = await this.infInicialRepositorio.save(createInformeInicialDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }*/



    async createInformeInicial(createInformeInicialDto: CreateInformeInicialDto) {
      try {
        if (createInformeInicialDto.id_subtipo === 227) {
          const existente = await this.infInicialRepositorio
            .createQueryBuilder('informe_inicial')
            .where('informe_inicial.id_subtipo = :idSubtipo', { idSubtipo: 227 })
            .andWhere('informe_inicial.id_informe = :idInforme', { idInforme: createInformeInicialDto.id_informe })
            .getOne();
    
          if (existente) {
            return this.responseService.success(null, "Ya existe un informe con id_subtipo 227 para este id_informe.");
          }
        }
    
        const resultado = await this.infInicialRepositorio.save(createInformeInicialDto);
        return this.responseService.success(resultado, "Registrado Correctamente.");
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


    async siExisteInformeSolicitud(data: InformeObraSolicitudDto) {
    try {
      const query = ` SELECT i.id_informe FROM public.informe AS i     
      WHERE  i.id_obra = $1 AND  id_tipo_informe=$2  AND id_solicitud =$3 AND i.id_estado =1;`;
      const params = [data.obra, data.tipo_informe, data.solicitud];
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
  jsonb_array_elements(descripcion::jsonb) AS f(x) WHERE id_informe =$1 AND id_estado =1 ) AS ijson   ON de.id_subtipo = ijson.idsubtipo
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


  async listaInformeObra(data: InformeObraDto) {
    try {

      const query = ` SELECT * FROM  public.vista_lista_informe_obra WHERE id_obra = $1  AND id_tipo_informe =$2`;
      const params = [data.obra, data.tipo_informe];
      const resultado = await this.informeRepositorio.query(query, params);
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

  /**
   * Obtener los datos del formulario
   */
  async obtenerDatosFormulario(idSolicitud: number, idModificacion: number, idTipoInforme: number) {
    const query = `SELECT * FROM sp_obtener_datos_formulario($1, $2, $3)`;
    const result = await this.dataSource.query(query, [idSolicitud, idModificacion, idTipoInforme]);

    return result.length ? result[0] : null; // Retorna el primer resultado o null si no hay datos
}

  /**
   * Actualizar los datos del formulario 
   */
  async actualizarFormulario(idModificacion: number, idInforme: number, datosFormulario: any) {
    const { plazo, antecedentes, justificacion, modificacionPlazo, textoAnexos, referencia, id_documento } = datosFormulario;
  
    const query = `SELECT public.sp_actualizar_datos_formulario($1, $2, $3, $4, $5, $6, $7, $8,$9)`;
  
    await this.dataSource.query(query, [
      idModificacion, idInforme,
      plazo, antecedentes, justificacion,
      modificacionPlazo, textoAnexos, referencia, JSON.stringify(id_documento) // Convierte el JSON a string para evitar errores
    ]);
  
    return { message: 'Formulario actualizado correctamente' };
  }

  // Guardar informe de obra con correlativo y solicitud
  async guardarInformeObra(data: any) {
    try {
      const {
        id_obra, usuario_registro, id_tipo_informe, antecedentes,
        analisis, obs_general, conclusion, recomendacion, 
        referencia, informe_modificacion, anexos, id_documento
      } = data;

      // 1. Crear correlativo
      const correlativoResp = await this.correlativoService.create({
        id_obra,
        id_tipo_documento: id_tipo_informe,
        correlativo: '',
        usuario_registro: usuario_registro,
        id_estado: 1,
      });
      const correlativo = correlativoResp.data;
      if (!correlativo || !correlativo.id_correlativo) {
        throw new Error('No se pudo crear el correlativo');
      }
      // 2. Crear solicitud
      const solicitudDto: CreateSolicitudDto = {
        id_tipo_solicitud: 0,
        id_estado_solicitud: 2,
        id_obra,
        id_estado_general: 23,
        id_usuario: usuario_registro,
        proveido: '',
        usuario_registro: usuario_registro,
        id_estado_registro: 1,
      };
      const respuestaSolicitud = await this.solicitudService.create(solicitudDto);
      const solicitud = respuestaSolicitud.data; // por tu estructura de responseService
      if (!solicitud || !solicitud.id_solicitud) {
        throw new Error('No se pudo crear la solicitud');
      }
      // 3. Crear informe
      const informeData = {
        id_obra,
        usuario_registro,
        id_tipo_informe,
        antecedentes,
        analisis,
        obs_general,
        conclusion,
        recomendacion,
        referencia,
        informe_modificacion,
        anexos,
        id_documento, 
        id_correlativo: correlativo.id_correlativo,
        id_solicitud: solicitud.id_solicitud,
        id_estado: 1
      };
      const nuevoInforme = await this.informeRepositorio.save(informeData);
      return this.responseService.success(nuevoInforme, 'Informe, correlativo y solicitud creados correctamente');
    } catch (error) {
      console.error('Error en guardarInformeConSolicitud:', error);
      return this.responseService.error('Ocurrió un error al guardar el informe con su solicitud.');
    }
  }

  
  //listar informes de obra para el supervisor
  async listarInformeObraSup(dto: ListaInformeObraDto) {
    const { id_obra } = dto;
    try {
      const resultado = await this.informeRepositorio.query(
        `SELECT * FROM sp_listar_informe_obra_sup($1)`,
        [id_obra]
      );
      return this.responseService.success(resultado);
    } catch (error) {
      console.error('Error al ejecutar sp_listar_informe_obra_sup:', error);
      return this.responseService.error('No se pudo listar los informes');
    }
  }

  //listar informes de obra para el fiscal
  async listarInformeObraFis(dto: ListaInformeObraDto) {
    const { id_obra } = dto;
    try {
      const resultado = await this.informeRepositorio.query(
        `SELECT * FROM sp_listar_informe_obra_fis($1)`,
        [id_obra]
      );
      return this.responseService.success(resultado);
    } catch (error) {
      console.error('Error al ejecutar sp_listar_informe_obra_fis:', error);
      return this.responseService.error('No se pudo listar los informes para el fiscal.');
    }
  }

  // Actualizar informe de obra
  async actualizarInformeObra(dto: UpdateInformeObraDto) {
    try {
      console.log('📥 DTO recibido:', JSON.stringify(dto));

      const {
        id_informe,
        antecedentes,
        analisis,
        obs_general,
        conclusion,
        recomendacion,
        referencia,
        informe_modificacion,
        anexos,
        id_documento,
      } = dto;

      const informe = await this.informeRepositorio.findOne({
        where: { id_informe, id_estado: 1 },
      });

      if (!informe) {
        throw new Error('No se encontró el informe para actualizar');
      }
      if (typeof informe.usuario_registro !== 'number' || isNaN(informe.usuario_registro)) {
        throw new Error('usuario_registro inválido');
      }
      if (typeof informe.id_estado !== 'number' || isNaN(informe.id_estado)) {
        throw new Error('id_estado inválido');
      }

      if (id_documento !== undefined) {
        if (typeof id_documento === 'string') {
          try {
            informe.id_documento = JSON.parse(id_documento);
          } catch {
            throw new Error('id_documento tiene formato incorrecto');
          }
        } else if (Array.isArray(id_documento)) {
          for (const doc of id_documento) {
            if (!doc || typeof doc.id_documento !== 'number' || isNaN(doc.id_documento)) {
              throw new Error('Cada objeto en id_documento debe tener un id_documento numérico válido');
            }
          }
          informe.id_documento = id_documento;
        } else {
          throw new Error('id_documento debe ser un arreglo de objetos o un string JSON válido');
        }
      }
      informe.antecedentes = antecedentes;
      informe.analisis = analisis;
      informe.obs_general = obs_general;
      informe.conclusion = conclusion;
      informe.recomendacion = recomendacion;
      if (referencia !== undefined) {
        informe.referencia = referencia;
      }

      if (informe_modificacion !== undefined) {
        informe.informe_modificacion = informe_modificacion;
      }

      if (anexos !== undefined) {
        informe.anexos = anexos;
      }
      const actualizado = await this.informeRepositorio.save(informe);
      return this.responseService.success(actualizado, 'Informe actualizado correctamente');
    } catch (error) {
      console.error(' Error en actualizarInformeObra:', error);
      return this.responseService.error(
        error instanceof Error ? error.message : 'Error inesperado al actualizar el informe'
      );
    }
  }

  // Obtener informe de obra por ID
  async obtenerInformeObraPorId(id: number) {
    const informe = await this.informeRepositorio.findOne({
      where: { id_informe: id, id_estado: 1 },
    });
    if (!informe) {
      throw new NotFoundException('Informe no encontrado');
    }
    const idDocumentos = (informe.id_documento || []).map(d => d.id_documento);
    let documentos: Partial<Documento>[] = [];
    if (idDocumentos.length > 0) {
      documentos = await this.documentoRepositorio.find({
        where: idDocumentos.map(id => ({ id_documento: id })),
        select: ['id_documento', 'ruta_documento', 'nombre_documento', 'fecha_registro', 'id_estado'],
      });
    }
    console.log({ ...informe, documentos });
    return this.responseService.success({
      ...informe,
      documentos
    });
  }

  //funcion para actualizar la fecha de informe para la aprobacion, abl, 11/06/2025, la fecha debe ser la actual
  async aprobarInforme(idSolicitud: number) {
    try {
      const informe = await this.informeRepositorio.findOneBy({ id_solicitud: idSolicitud });
      if (!informe) {
        throw new NotFoundException('Informe no encontrado');
      }
      informe.fecha_aprobacion = new Date();
      await this.informeRepositorio.save(informe);
      const solicitud = await this.solicitudRepositorio.findOne({ where: { id_solicitud: idSolicitud } });
      if (!solicitud) {
        throw new NotFoundException('Solicitud no encontrada');
      }
      solicitud.id_estado_solicitud = 4;
      await this.solicitudRepositorio.save(solicitud);

      return this.responseService.success(informe, "Fecha de informe actualizada correctamente.");
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  // Función para obtener el tipo de informe por solicitud
  async obtenerTipoInformePorSolicitud(dto: BuscarTipoInformeDto) {
    const { id_solicitud } = dto;
    try {
      const resultado = await this.informeRepositorio.findOne({
        where: {
          id_solicitud,
          id_estado: 1
        },
        select: ['id_tipo_informe', 'id_informe']
      });

      if (!resultado) {
        return this.responseService.error('No se encontró un informe con esos datos.');
      }
      return this.responseService.success(resultado);
    } catch (error) {
      console.error('Error al consultar tipo de informe:', error);
      return this.responseService.error('No se pudo obtener el tipo de informe.');
    }
  }
/*****************************************************************************************************************************/
  async createActaEntregaProvicional(data: CreateActaEntregaProvicionalDto) {
    try {
      const {
        id_obra,
        hora_registro,
        obs_general,
        id_documento,
        usuario_registro,
        periodo_correccion
      } = data;

      // 1. Crear solicitud
      const solicitudDto: CreateSolicitudDto = {
        id_tipo_solicitud: 1,
        id_estado_solicitud: 2,
        id_obra,
        id_estado_general: 25,
        id_usuario: usuario_registro,
        proveido: '',
        usuario_registro: usuario_registro,
        id_estado_registro: 1,
      };

      const respuestaSolicitud = await this.solicitudService.create(solicitudDto);
      const solicitud = respuestaSolicitud.data;

      if (!solicitud || !solicitud.id_solicitud) {
        throw new Error('No se pudo crear la solicitud');
      }

      // 2. Crear informe sin correlativo
      const nuevoInforme = this.informeRepositorio.create({
        id_obra,
        id_tipo_informe: 342,
        hora_registro,
        obs_general,
        id_documento,
        usuario_registro,
        periodo_correccion,
        id_solicitud: solicitud.id_solicitud,
        id_estado: 1,
        antecedentes: '',
        analisis: '',
        conclusion: '',
        recomendacion: ''
      });

      const resultado = await this.informeRepositorio.save(nuevoInforme);
      return this.responseService.success(resultado, "Acta de entrega provisional registrada correctamente.");
    } catch (error) {
      console.error('Error en createActaEntregaProvicional:', error);
      return this.responseService.error('No se pudo registrar el acta de entrega provisional.');
    }
  }

  async listarActasEntregaProvisional(dto: ListaInformeObraDto) {
  const { id_obra } = dto;
  try {
    const resultado = await this.informeRepositorio.query(
      `SELECT * FROM sp_listar_acta_entrega_provisional($1)`,
      [id_obra]
    );
    return this.responseService.success(resultado, "Actas de entrega provisional listadas correctamente.");
  } catch (error) {
    console.error('Error al ejecutar sp_listar_acta_entrega_provisional:', error);
    return this.responseService.error('No se pudo listar las actas de entrega provisional.');
  }
}

async getActaEntregaProvisionalById(id_informe: number) {
  try {
    const informe = await this.informeRepositorio.findOne({
      where: { id_informe, id_estado: 1 },
    });

    if (!informe) {
      return this.responseService.error('No se encontró el acta.');
    }

    const idDocumentos = (informe.id_documento || []).map(doc => doc.id_documento);
    let documentos: Partial<Documento>[] = [];

    if (idDocumentos.length > 0) {
      documentos = await this.documentoRepositorio.find({
        where: idDocumentos.map(id => ({ id_documento: id })),
        select: ['id_documento', 'nombre_documento', 'ruta_documento', 'fecha_registro'],
      });
    }

    return this.responseService.success({
      ...informe,
      documentos
    }, "Acta cargada correctamente.");
  } catch (error) {
    console.error('Error al cargar acta:', error);
    return this.responseService.error('No se pudo obtener el acta para edición.');
  }
}

async updateActaEntregaProvisional(dto: UpdateActaEntregaProvDto) {
  try {
    const { id_informe, hora_registro, periodo_correccion, obs_general, id_documento } = dto;

    const informe = await this.informeRepositorio.findOne({
      where: { id_informe, id_estado: 1 },
    });

    if (!informe) {
      throw new Error('Acta no encontrada para actualizar');
    }

    if (hora_registro !== undefined) informe.hora_registro = hora_registro;
    if (periodo_correccion !== undefined) informe.periodo_correccion = periodo_correccion;
    if (obs_general !== undefined) informe.obs_general = obs_general;

    if (id_documento !== undefined) {
      if (!Array.isArray(id_documento)) {
        throw new Error('id_documento debe ser un arreglo de objetos');
      }
      informe.id_documento = id_documento;
    }

    const actualizado = await this.informeRepositorio.save(informe);
    return this.responseService.success(actualizado, 'Acta actualizada correctamente.');
  } catch (error) {
    console.error('Error en updateActaEntregaProvisional:', error);
    return this.responseService.error('No se pudo actualizar el acta.');
  }
}





}
