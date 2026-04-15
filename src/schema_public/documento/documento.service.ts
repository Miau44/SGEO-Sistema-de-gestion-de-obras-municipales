import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { ResponseService } from 'src/response.service';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, DataSource, EntityManager, Not, Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { ListaDocumentoDto } from './dto/listaDocumento.dto';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import { Informe } from 'src/schema_public/informe/entities/informe.entity';
import { DocumentoObraDto } from './dto/documento_obra.dto';
import { LogService } from '../log/log.service';
import * as http from 'http';

@Injectable()
export class DocumentoService {
  private readonly host: string;
  private readonly uploadUrl: string;
  private readonly sistema: string;
  private readonly user_registro: string;

  constructor(
    @InjectRepository(Documento)
    private documentoRepositorio: Repository<Documento>,
    @InjectRepository(Informe)
    private readonly informeRepositorio: Repository<Informe>,
    private responseService: ResponseService,
    private configService: ConfigService,
    private entityManager: EntityManager,
    private logService: LogService,
    private dataSource: DataSource
  ) {
    this.host = String(process.env.HOST_ADJUNTO);
    this.uploadUrl = String(process.env.URL_ADJUNTO);
    this.sistema = String(process.env.SISTEMA);
    this.user_registro = String(process.env.USR_REGISTRO);

    //this.uploadUrl = this.configService.get<string>('WEB_UPLOAD_URL') || 'http://192.168.6.140:3300/documento/saveFile/';
  }

  async create(createDocumentoDto: CreateDocumentoDto) {
    try {
      const resultado =
        await this.documentoRepositorio.save(createDocumentoDto);
      return this.responseService.success(resultado, 'Guardado Correctamente.');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async generateDocumentRoute(
    id_obra: number,
    id_tipo_documento: number,
    usuario_registro: number,
    ciNitFuncionario: string,
    usuario_desc: string,
  ): Promise<string> {
    const fecha = new Date();
    const formattedDate = fecha.toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const ruta = `${ciNitFuncionario}/${usuario_desc}/${id_obra}/${id_tipo_documento}/${id_obra}_${id_tipo_documento}_${formattedDate}_${timestamp}`;
    console.log('ruta nueva agregando funcionario', ruta);
    console.log('Body recibido:', {
      id_obra,
      id_tipo_documento,
      usuario_registro,
      ciNitFuncionario,
      usuario_desc,
    });
    return ruta;
  }

  normalizeFileName(fileName: string): string {
    return fileName
      .normalize('NFD') // Separa los caracteres acentuados de sus componentes
      .replace(/[\u0300-\u036f]/g, '') // Elimina los caracteres diacríticos (tildes)
      .replace(/[^a-zA-Z0-9.-]/g, '_'); // Reemplaza caracteres especiales con "_"
  }

  async saveDocumentoUrl(
    id_documento: number,
    url_file: string,
  ): Promise<void> {
    await this.documentoRepositorio.update(id_documento, {
      ruta_documento: url_file,
      id_estado: 1,
    });
  }

  async createDocumento(documento: Documento): Promise<Documento> {
    return await this.documentoRepositorio.save(documento);
  }

  async subirArchivo(file: Express.Multer.File, datos: any): Promise<any> {
    const form = new FormData();
    console.log('datos:', datos);

    form.append('file', file.buffer, file.originalname);
    // form.append('file', file.buffer, {
    //   filename: file.originalname,
    //   contentType: file.mimetype,
    // });
    form.append('sistema', datos.sistema);
    form.append('ruta', datos.ruta);
    form.append('resumen', datos.resumen);
    form.append('palabraClave', datos.palabraClave);
    form.append('usuario', datos.usuario);

    const options: http.RequestOptions = {
      method: 'POST',
      host: this.host,
      port: 3300,
      path: '/documento/saveFile',
      headers: form.getHeaders(),
    };

    return new Promise((resolve, reject) => {
      console.log('respuesta directa:', resolve, reject);

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log('respuesta end:');
          resolve(data); // ← se devuelve como string, tal como viene del servicio
        });
      });

      req.on('error', (err) => {
        console.log('respuesta error:', err);
        reject(err); // ← solo se devuelve el error sin adornos
      });

      form.pipe(req);
    });
  }

  async uploadFileToExternalService(
    file: Express.Multer.File,
    ruta: string,
    resumen: string,
    palabraClave: string,
    usuario: string,
  ): Promise<any> {
    const sistema = this.sistema;
    const usuario_servicio = this.user_registro;

    const jsonDebug: Record<string, any> = {
      sistema: this.sistema,
      ruta,
      resumen,
      palabraClave,
      usuario: this.user_registro,
      file: {
        originalname: file.originalname,
        size: file.buffer.length,
        mimetype: file.mimetype,
      },
    };

    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);
    formData.append('sistema', this.sistema); // Valor fijo
    formData.append('ruta', ruta);
    formData.append('resumen', resumen);
    formData.append('palabraClave', palabraClave);
    formData.append('usuario', this.user_registro);
    try {
      //usuario = this.user_registro;
      const datos = {
        sistema,
        ruta,
        resumen,
        palabraClave,
        usuario: usuario_servicio,
      };
      const response = await this.subirArchivo(file, datos);
      const parsed = JSON.parse(response);

      // ✅ Log de éxito
      await this.logService.create({
        id_usuario: 0,
        parametro: JSON.stringify({
          ...jsonDebug,
          sistema,
          ruta,
          resumen,
          palabraClave,
          usuario_servicio,
        }),
        mensaje: `Archivo subido: ${file.originalname}`,
        funcionalidad: 'Adjuntos',
        respuesta: parsed,
      });

      return {
        parsed,
        uploadUrl: this.uploadUrl,
        ruta,
        resumen,
        palabraClave,
      };
    } catch (error: any) {
      const responseData = error?.response?.data;

      // ⛔ Log de error
      await this.logService.create({
        id_usuario: 0,
        parametro: JSON.stringify({
          ...jsonDebug,
          sistema,
          ruta,
          resumen,
          palabraClave,
          usuario_servicio,
        }),
        mensaje: `Error al subir archivo: ${file.originalname}`,
        funcionalidad: 'Adjuntos',
        respuesta: JSON.stringify(responseData),
      });

      console.error('⛔ Error al subir archivo:', {
        mensaje: error.message,
        data: responseData,
      });
      return {
        ...jsonDebug,
        sistema,
        ...responseData,
        uploadUrl: this.uploadUrl,
        ruta,
        resumen,
        palabraClave,
        usuario_servicio,
      };
    }
  }

  async obtenerDocumentosPorInforme(idInforme: number): Promise<Documento[]> {
    const query = `
      SELECT * FROM documento 
      WHERE id_documento IN (
        SELECT (jsonb_array_elements(informe.id_documento::jsonb)->>'id_documento')::INTEGER
        FROM informe 
        WHERE id_informe = $1
      );
    `;

    try {
      const documentos = await this.entityManager.query(query, [idInforme]);
      return documentos;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener documentos: ${error.message}`);
      } else {
        throw new Error('Error al obtener documentos');
      }
    }
  }

  //variables para la visualizacion de
  id_obra: number;
  id_tipo_documento: number[];

  //servico para listar y visualizar los documentos pdf (para borrar)
  /**
   * modificar esto este servicio TEMPORAL, ya que no esta del todo bien, esto es para listar los documetnos
   * en la parte de seguimiento por obra
   */
  async obtenerDocsPdfxObra(idObra: number): Promise<any[]> {
    try {
      if (!idObra) {
        throw new Error('id_obra es requerido');
      }

      const query = `
      SELECT 
        o.id_obra,
        f.desc_carpeta AS nombre_obra,
        json_agg(
          json_build_object(
            'id_tipo_documento', d.id_tipo_documento,
            'documentos', (
              SELECT json_agg(
                json_build_object(
                  'id_documento', doc.id_documento,
                  'ruta_documento', doc.ruta_documento,
                  'usuario_registro', doc.usuario_registro,
                  'observacion', doc.observacion
                )
              )
              FROM documento doc
              WHERE doc.id_obra = d.id_obra
              AND doc.id_tipo_documento = d.id_tipo_documento
              AND doc.ruta_documento IS NOT NULL
            )
          )
        ) AS tipos_documentos
        FROM documento d
        JOIN obra o ON d.id_obra = o.id_obra
        JOIN ficha f ON o.id_ficha = f.id_ficha
        WHERE d.id_obra = $1 
        GROUP BY o.id_obra, f.desc_carpeta;
      `;

      // Parámetros de la consulta
      const params = [idObra];

      const result: {
        id_obra: number;
        nombre_obra: string;
        tipos_documentos: any[];
      }[] = await this.documentoRepositorio.query(query, params);

      // 🔹 Filtrar obras sin documentos después de la consulta
      return result.filter((obra) =>
        Array.isArray(obra.tipos_documentos)
          ? obra.tipos_documentos.some(
            (tipo: { documentos: any[] }) =>
              Array.isArray(tipo.documentos) && tipo.documentos.length > 0,
          )
          : false,
      );
    } catch (error) {
      console.error('Error en obtenerDocsPdfxObra:', (error as Error).message);
      throw error;
    }
  }

  async documentosXObra(data: DocumentoObraDto) {
    try {
      let query = `
    SELECT  td.id_tipo_documento, td.desc_tipo_documento, sub.desc_subtipo AS sistema, 
    td.id_subtipo_documento, td.id_etapa_documento,
    d.id_documento, d.id_obra , d.fecha_registro, d.usuario_registro, d.cumple,  d.ruta_documento, d.observacion
    FROM  tipo_documento as td
    INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
    LEFT OUTER JOIN  public.vista_documentos as d ON td.id_tipo_documento=d.id_tipo_documento AND d.id_obra = $1  	`;
      if (data.anticipo) {
        query += ` WHERE   td.id_tipo_documento IN(20,31)  ORDER BY td.id_tipo_documento ASC`;
      } else {
        query += `ORDER BY td.id_tipo_documento ASC`;
      }

      const params = [data.obra];
      const resultado = await this.documentoRepositorio.query(query, params);
      return this.responseService.success(resultado, 'Listado Correctamente.');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listaDocumentos(data: ListaDocumentoDto) {
    try {
      let query = `		SELECT  td.id_tipo_documento,d.nombre_documento, td.desc_tipo_documento, sub.desc_subtipo AS sistema, 
    td.id_subtipo_documento, td.id_etapa_documento,
    d.id_documento, d.id_obra , d.fecha_registro, d.usuario_registro, d.cumple,  d.ruta_documento
    FROM  tipo_documento as td
    INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
    INNER  JOIN  documento as d ON td.id_tipo_documento=d.id_tipo_documento 
    AND d.id_obra = $1 
    WHERE  d.cumple =true AND	 d.id_estado = 1	
    ${data.id_tipo_documento !== null ? ' AND td.id_tipo_documento =$2' : ''}
    ORDER BY td.id_tipo_documento ASC `;
      const params: any[] = [data.id_obra];
      if (data.id_tipo_documento !== null) {
        params.push(data.id_tipo_documento);
      }
      const resultado: any[] = await this.documentoRepositorio.query(
        query,
        params,
      );
      return this.responseService.success(resultado, 'Listado Correctamente.');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listaDocumentosXObraConAdjunto(data: ListaDocumentoDto) {
    try {
      let query = `SELECT * FROM public.documento as d
INNER JOIN public.tipo_documento as td ON d.id_tipo_documento = td.id_tipo_documento 
WHERE id_obra = $1 AND cumple = true AND d.id_estado = 1 AND td.id_estado = 1;`;
      const params: any[] = [data.id_obra];

      const resultado: any[] = await this.documentoRepositorio.query(
        query,
        params,
      );
      return this.responseService.success(resultado, 'Listado Correctamente.');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async update(id: number, updateDocumentoDto: Partial<Documento>) {
    try {
      updateDocumentoDto.fecha_modificacion = new Date();
      await this.documentoRepositorio.update(id, updateDocumentoDto);
      return this.responseService.success(
        {},
        'Documento actualizado correctamente.',
      );
    } catch (error) {
      return this.responseService.error(
        error,
        'Error al actualizar el documento.',
      );
    }
  }

  async updateRutaDoc(id: number, ruta_documento: string) {
    try {
      const params: any[] = [id, ruta_documento];
      const doc = await this.documentoRepositorio.findOne({
        where: { id_documento: id },
      });
      if (!doc) {
        return this.responseService.error(
          null,
          `No se encontró el documento con id ${id}`,
          404
        );
      }
      console.log(doc);
      if (doc != null) {
        doc.ruta_documento = ruta_documento;
      }
      const respuesta_doc = await this.documentoRepositorio.save(doc);
      // let query = `UPDATE documento set ruta_documento = $1  where id_documento = $2`;
      // console.log(query);
      // const resultado: any[] = await this.documentoRepositorio.query(
      //   query,
      //   params,
      // );
      return this.responseService.success(respuesta_doc, 'documento actualizado.');
    } catch (error) {
      return this.responseService.error(
        error,
        'Error al actualizar el documento.',
      );
    }
  }

  /****************************************************************************************
   **************************Generacion de documentos hacia atras**************************/

  async listarInformesDeObraPendientesDeDocumento(): Promise<any> {
    try {
      const query = `
     SELECT i.id_informe, i.id_obra, i.id_tipo_informe
          FROM solicitud s
          JOIN informe i ON s.id_obra = i.id_obra
          WHERE i.fecha_aprobacion is not null
                AND (i.id_documento IS NULL OR i.id_documento::jsonb = '[]'::jsonb)
                AND i.id_estado = 1
                AND i.id_tipo_informe IN (295, 296)
    `;

      const resultado: {
        id_informe: number;
        id_obra: number;
        id_tipo_informe: number;
      }[] = await this.documentoRepositorio.query(query);

      return this.responseService.success(
        resultado.map((item) => ({
          ...item,
          servicioReporte:
            item.id_tipo_informe === 295
              ? 'informeDeObraSupervisor'
              : 'informeDeObraFiscal',
          nombre_archivo: `informe_${item.id_informe}.pdf`,
        })),
        'Informes sin documento listados correctamente.',
      );
    } catch (error) {
      return this.responseService.error(
        error,
        'Error al listar informes sin documentos.',
      );
    }
  }

  async listarInformesInicialesSinDocumento(): Promise<any> {
    try {
      const query = `
      SELECT 
        i.id_informe,
        i.id_tipo_informe,
        i.id_obra,
        i.fecha_aprobacion AS fecha_aprobacion_informe
      FROM informe i
      WHERE i.id_tipo_informe = 235
        AND i.fecha_aprobacion IS NOT NULL
        AND (i.id_documento IS NULL OR i.id_documento::jsonb = '[]'::jsonb)
        AND i.id_estado = 1
      ORDER BY i.id_informe DESC
    `;
      const resultado = await this.informeRepositorio.query(query);

      return this.responseService.success(
        resultado.map((item: any) => ({
          ...item,
          servicioReporte: 'informeInicial',
          nombre_archivo: `Informe_inicial_${item.id_informe}.pdf`,
        })),
        'Informes iniciales sin documento listados correctamente.',
      );
    } catch (error) {
      return this.responseService.error(
        error,
        'Error al listar informes iniciales sin documento.',
      );
    }
  }

  async listarInformesPreviosSinDocumento(): Promise<any> {
    try {
      const query = `
      SELECT 
        i.id_informe,
        i.id_tipo_informe,
        i.id_obra,
        i.fecha_aprobacion
      FROM informe i
      WHERE i.id_tipo_informe = 236
        AND i.id_estado = 1
        AND i.fecha_aprobacion IS NOT NULL
        AND (i.id_documento IS NULL OR i.id_documento::jsonb = '[]'::jsonb)
      ORDER BY i.id_informe DESC
    `;
      const resultado = await this.informeRepositorio.query(query);

      return this.responseService.success(
        resultado.map((item: any) => ({
          ...item,
          servicioReporte: 'informeActividadesPrevias',
          nombre_archivo: `Informe_actividades_previas_${item.id_informe}.pdf`,
        })),
        'Informes de actividades previas sin documento listados correctamente.',
      );
    } catch (error) {
      return this.responseService.error(
        error,
        'Error al listar informes de actividades previas sin documento.',
      );
    }
  }

  async listarInformesPrevisionPagosSinDocumento(): Promise<any> {
    try {
      const query = `
      SELECT 
        i.id_informe,
        i.id_obra,
        i.id_tipo_informe,
        i.fecha_aprobacion AS fecha_aprobacion_informe
      FROM informe i
      WHERE i.id_tipo_informe = 237
        AND i.fecha_aprobacion IS NOT NULL
        AND i.id_estado = 1
        AND (i.id_documento IS NULL OR i.id_documento::jsonb = '[]'::jsonb)
      ORDER BY i.id_informe DESC;
    `;
      const resultado = await this.informeRepositorio.query(query);

      return this.responseService.success(
        resultado.map((item: any) => ({
          ...item,
          servicioReporte: 'reportePrevisionPagos',
          nombre_archivo: `prevision_pagos_${item.id_informe}.pdf`,
        })),
        'Informes de previsión de pagos sin documento listados correctamente.',
      );
    } catch (error) {
      return this.responseService.error(
        error,
        'Error al listar informes de previsión de pagos sin documento.',
      );
    }
  }

  async actualizarSoloRutaDocumento(id_documento: number, ruta: string) {
    try {
      await this.documentoRepositorio.update(id_documento, {
        ruta_documento: ruta,
        fecha_modificacion: new Date()
      });
      return this.responseService.success(
        {},
        'Ruta del documento actualizada correctamente.'
      );
    } catch (error) {
      return this.responseService.error(error, 'Error al actualizar la ruta del documento.');
    }
  }
  /***coreccion de informe incial */
  async listarInformesInicialesConDocumento(): Promise<any> {
    try {
      const query = `
     SELECT
	documento.id_documento,
  documento.id_obra,
  informe.id_tipo_informe,
  ruta_documento ,
        informe.id_informe
FROM 
  documento
JOIN 
  informe ON informe.id_obra = documento.id_obra 
          AND informe.id_tipo_informe = 235 
          AND informe.fecha_aprobacion IS NOT NULL
WHERE 
  documento.id_tipo_documento = 235 
  AND documento.id_estado = 1
ORDER BY 
  documento.id_obra ASC
LIMIT 5`;

      const resultado = await this.informeRepositorio.query(query);

      return this.responseService.success(resultado, 'Informes iniciales con documento listados correctamente.');
    } catch (error) {
      return this.responseService.error(error, 'Error al listar informes iniciales con documento.');
    }
  }


  // Método para listar documentos por obra
  async listarVistaDocumentosPorObra(id_obra: number): Promise<any> {
    try {
      const resultado = await this.dataSource.query(
        `SELECT * FROM sp_listar_vista_documentos_por_obra($1)`,
        [id_obra],
      );
      return this.responseService.success(resultado, 'Listado correctamente');
    } catch (error) {
      console.error('Error al listar documentos por obra:', error);
      return this.responseService.error('No se pudo listar los documentos');
    }
  }



  async listadoDocumentospagos(id_informe: number): Promise<any> {
    try {
      //get lista de tipos documentos
      const listaTiposDocumentos = await this.dataSource.query(`SELECT id_tipo_documento, desc_tipo_documento FROM tipo_documento WHERE id_subtipo_documento = 353 AND id_estado = 1`);

      //select de la tabla informe
      const informe = await this.informeRepositorio.findOne({
        where: { id_informe: id_informe },
        select: ['id_documento', 'id_obra'],
      });
      var array_documentos: number[] = [];
      if (informe != null && informe.id_documento != null) {
        array_documentos = informe.id_documento.map((doc) => doc.id_documento);

      }

      const listaDocumentos = await this.dataSource.query(
        `SELECT d.id_documento,id_tipo_documento,ruta_documento,nombre_documento,TO_CHAR(fecha_registro, 'DD/MM/YYYY') AS fecha_registro
      FROM documento d WHERE d.id_estado = 1 AND d.id_documento = ANY($1)`, [array_documentos]);
      //console.log("documentos", listaDocumentos);
      listaTiposDocumentos.forEach((tipo: { id_tipo_documento: any; ruta_documento: any; documentos: any[]; }) => {
        tipo.documentos = [];
        listaDocumentos.forEach((doc: {
          fecha_registro: any;
          nombre_documento: any; id_tipo_documento: any; ruta_documento: any; id_documento: number
        }) => {

          if (tipo.id_tipo_documento === doc.id_tipo_documento) {
            tipo.documentos.push({
              id_documento: doc.id_documento,
              ruta_documento: doc.ruta_documento,
              nombre_documento: doc.nombre_documento,
              fecha_registro: doc.fecha_registro
            });
          }
        }
        );
      });

      return listaTiposDocumentos;
    } catch (error) {
      console.error('Error al listar documentos por obra:', error);
      return this.responseService.error('No se pudo listar los documentos');
    }
  }

  async eliminarDocumentosPagos(id_informe: number, id_documento: number,id_usuario:number): Promise<any> {
    try {
      //cambiar id_estado a 0 (eliminado) de la tabla documento
      const resDoc = await this.documentoRepositorio.update(id_documento, { id_estado: 0 });

      const informe = await this.informeRepositorio.findOne({
        where: { id_informe: id_informe }
      });
      
      var array_documentos: number[] = [];
      if (informe != null && informe.id_documento != null && informe.id_documento.length > 0) {
        array_documentos = informe.id_documento.map((doc) => doc.id_documento);
      }
      else{
        this.log(id_usuario,id_informe,id_documento,'ERROR:No hay documentos asociados al informe',informe?.id_documento);
        return this.responseService.error("ERROR", 'No hay documentos asociados al informe');
      }
      
      //verificar que el documento a eliminar exista en informe.id_documento
      if (!informe.id_documento || !informe.id_documento.some(doc => doc.id_documento == id_documento)) {
        this.log(id_usuario,id_informe,id_documento,`ERROR:Documento no encontrado en la tabla informe, id_documento: ${id_documento}`,informe.id_documento);
        return this.responseService.error("ERROR", 'Documento no encontrado en la tabla informe informe');
      }

      let docsInicio = informe.id_documento || [];
      const documentosValidos = await this.documentoRepositorio.find({where: {id_documento: Any(docsInicio.map(doc => doc.id_documento)),id_estado: 1}});
      const documentosValidosIds = documentosValidos.map(doc => doc.id_documento);
      console.log("documentosValidosIds:", documentosValidosIds);
      var docsFinal:any = [];
      documentosValidosIds.forEach(id => {
        docsFinal.push({id_documento: id});
      });
      
      informe.id_documento = docsFinal;
      console.log("docs",docsInicio,docsFinal);
      const resInforme =  await this.informeRepositorio.save(informe);
      if(resInforme){ this.log(id_usuario,id_informe,id_documento,`Documento eliminado correctamente, id_documento: ${id_documento}`,resInforme.id_documento)}
      else{ this.log(id_usuario,id_informe,id_documento,`ERROR:Error al eliminar adjunto, id_documento: ${id_documento}`,resInforme); 
      return this.responseService.error("ERROR", 'Error al eliminar adjunto');
    }
    } catch (error) {
      this.log(id_usuario,id_informe,id_documento,`ERROR:Error al eliminar adjunto, id_documento: ${id_documento}`,error);
      return this.responseService.error(error, 'Error al listar informes iniciales con documento.');
    }
  }

  async listarDocumentosPorSubtipo(id_informe: number, id_subtipo_documento: number): Promise<any> {
    try {
      //get lista de tipos documentos
      const listaTiposDocumentos = await this.dataSource.query(`SELECT id_tipo_documento, desc_tipo_documento FROM tipo_documento WHERE id_subtipo_documento = $1 AND id_estado = 1`,
      [id_subtipo_documento]);

      //select de la tabla informe
      const informe = await this.informeRepositorio.findOne({
        where: { id_informe: id_informe },
        select: ['id_documento', 'id_obra'],
      });
      var array_documentos: number[] = [];
      if (informe != null && informe.id_documento != null) {
        array_documentos = informe.id_documento.map((doc) => doc.id_documento)
      }

      const listaDocumentos = await this.dataSource.query(
        `SELECT d.id_documento,id_tipo_documento,ruta_documento,nombre_documento,TO_CHAR(fecha_registro, 'DD/MM/YYYY') AS fecha_registro
      FROM documento d WHERE d.id_estado = 1 AND d.id_documento = ANY($1)`, [array_documentos]);
      //console.log("documentos", listaDocumentos);
      listaTiposDocumentos.forEach((tipo: { id_tipo_documento: any; ruta_documento: any; documentos: any[]; }) => {
        tipo.documentos = [];
        listaDocumentos.forEach((doc: {
          fecha_registro: any;
          nombre_documento: any; id_tipo_documento: any; ruta_documento: any; id_documento: number
        }) => {
          if (tipo.id_tipo_documento === doc.id_tipo_documento) {
            tipo.documentos.push({
              id_documento: doc.id_documento,
              ruta_documento: doc.ruta_documento,
              nombre_documento: doc.nombre_documento,
              fecha_registro: doc.fecha_registro
            });
          }
        }
        );
      });
      return listaTiposDocumentos;
    } catch (error) {
      console.error('Error al listar documentos por obra:', error);
      return this.responseService.error('No se pudo listar los documentos');
    }
  }

  log(id_usuario:number,id_informe:number,id_documento:number,mensaje:any,respuesta:any){
    this.logService.create({
        id_usuario: id_usuario,
        parametro: JSON.stringify({id_informe, id_documento}),
        mensaje: mensaje,
        funcionalidad: 'Eliminar adjunto',
        respuesta: JSON.stringify({respuesta})
      });
  }
  
  async listaImagenesReporteFotografico(id_obra: number) {
    try {
      const query = `SELECT * FROM public.sp_listar_imagenes_reporte_fotografico($1);`;
      const params = [id_obra];
      
      const resultado = await this.documentoRepositorio.query(query, params);

      return this.responseService.success(resultado, 'Imágenes listadas correctamente.');
    } catch (error) {
      return this.responseService.error(error);
    }
  }
}
