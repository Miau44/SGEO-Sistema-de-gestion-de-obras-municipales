import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { ResponseService } from 'src/response.service';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, EntityManager, Not, Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { ListaDocumentoDto } from './dto/listaDocumento.dto';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import axios from 'axios';
import { DocumentoObraDto } from './dto/documento_obra.dto';
import { LogService } from '../log/log.service';

@Injectable()
export class DocumentoService {

  private readonly uploadUrl: string;
  private readonly sistema : string;
  private readonly user_registro : string;


  constructor(
    @InjectRepository(Documento) private documentoRepositorio: Repository<Documento>,
    private responseService: ResponseService,
    private configService: ConfigService,
    private entityManager: EntityManager,
    private logService:LogService,
  ) {
    this.uploadUrl = String(process.env.URL_ADJUNTO);
    this.sistema = String(process.env.SISTEMA);
    this.user_registro = String(process.env.USR_REGISTRO);
    
    //this.uploadUrl = this.configService.get<string>('WEB_UPLOAD_URL') || 'http://192.168.6.140:3300/documento/saveFile/';
  }

  async create(createDocumentoDto: CreateDocumentoDto) {
    try {
      const resultado = await this.documentoRepositorio.save(createDocumentoDto);
      return this.responseService.success(resultado, "Guardado Correctamente.")
        } catch (error) {
          return this.responseService.error(error);
        }      
  }


  async generateDocumentRoute(
    id_obra: number,
    id_tipo_documento: number,
    usuario_registro: number,
    ciNitFuncionario: string,
    usuario_desc:string
  ): Promise<string> {
    const fecha = new Date();
    const formattedDate = fecha.toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const ruta = `${ciNitFuncionario}/${usuario_desc}/${id_obra}/${id_tipo_documento}/${id_obra}_${id_tipo_documento}_${formattedDate}_${timestamp}`;
    console.log('ruta nueva agregando funcionario',ruta);
    console.log('Body recibido:', { id_obra, id_tipo_documento, usuario_registro, ciNitFuncionario, usuario_desc });
    return ruta;
  }

    
  normalizeFileName(fileName: string): string {
    return fileName
      .normalize("NFD") // Separa los caracteres acentuados de sus componentes
      .replace(/[\u0300-\u036f]/g, "") // Elimina los caracteres diacríticos (tildes)
      .replace(/[^a-zA-Z0-9.-]/g, "_"); // Reemplaza caracteres especiales con "_"
  }

  async saveDocumentoUrl(id_documento: number, url_file: string): Promise<void> {
    await this.documentoRepositorio.update(id_documento, { ruta_documento: url_file,id_estado:1 });
  }

  async createDocumento(documento: Documento): Promise<Documento> {
    return await this.documentoRepositorio.save(documento);
  }
  
  async uploadFileToExternalService(
    file: Express.Multer.File,
    ruta: string,
    resumen: string,
    palabraClave: string,
    usuario: string
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
        mimetype: file.mimetype
      }
    };

    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);
    formData.append('sistema', this.sistema); // Valor fijo
    formData.append('ruta', ruta);
    formData.append('resumen', resumen);
    formData.append('palabraClave', palabraClave);
    formData.append('usuario', this.user_registro);
    var  res = null;
    try {
      const response = await axios.post(this.uploadUrl, formData, {
        headers: formData.getHeaders(),
      });
      
      res = response.data;
      const responseData = response.data as {
        id_documento: number;
        nombre_documento: string;
        url_file: string;
        estado?: boolean;
      };
  
      if (!responseData.url_file || !responseData.url_file.startsWith('http')) {
        throw new Error('URL devuelta no es válida o incompleta');
      }

      // ✅ Log de éxito
    await this.logService.create({
      id_usuario:0,
      parametro: JSON.stringify({...jsonDebug,sistema, ruta, resumen, palabraClave,usuario_servicio }),
      mensaje: `Archivo subido: ${file.originalname}`,
      funcionalidad: 'Adjuntos',
      respuesta: responseData.url_file,
    });
  
      return {
        ...jsonDebug,
        ...responseData,
        uploadUrl: this.uploadUrl,
        ruta,
        resumen,
        palabraClave,
      };
    } catch (error: any) {
      const responseData = error?.response?.data;

      // ⛔ Log de error
      await this.logService.create({
        id_usuario:0,
        parametro: JSON.stringify({ ...jsonDebug,sistema,ruta, resumen, palabraClave,usuario_servicio }),
        mensaje: `Error al subir archivo: ${file.originalname}`,
        funcionalidad: 'Adjuntos',   
        respuesta: JSON.stringify(res),
      });
  
      console.error('⛔ Error al subir archivo:', {
        mensaje: error.message,
        data: responseData,
      });  
      return{
        ...jsonDebug,
        sistema,
        ...responseData,
        uploadUrl: this.uploadUrl,
        ruta,
        resumen,
        palabraClave,
        usuario_servicio
      }
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

      const result: { id_obra: number; nombre_obra: string; tipos_documentos: any[] }[] =
        await this.documentoRepositorio.query(query, params);

      // 🔹 Filtrar obras sin documentos después de la consulta
      return result.filter((obra) =>
        Array.isArray(obra.tipos_documentos)
          ? obra.tipos_documentos.some(
              (tipo: { documentos: any[] }) => Array.isArray(tipo.documentos) && tipo.documentos.length > 0
            )
          : false
      );
    } catch (error) {
      console.error('Error en obtenerDocsPdfxObra:', (error as Error).message);
      throw error;
    }
  }

  
  
  async documentosXObra(data:DocumentoObraDto) {
    try {
      let query = `
    SELECT  td.id_tipo_documento, td.desc_tipo_documento, sub.desc_subtipo AS sistema, 
    td.id_subtipo_documento, td.id_etapa_documento,
    d.id_documento, d.id_obra , d.fecha_registro, d.usuario_registro, d.cumple,  d.ruta_documento, d.observacion
    FROM  tipo_documento as td
    INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
    LEFT OUTER JOIN  public.vista_documentos as d ON td.id_tipo_documento=d.id_tipo_documento AND d.id_obra = $1  	`;
    if(data.anticipo){
      query += ` WHERE   td.id_tipo_documento IN(20,31)  ORDER BY td.id_tipo_documento ASC`;
    } else {

      query += `ORDER BY td.id_tipo_documento ASC`;

    }

      const params = [data.obra];  
     const resultado = await this.documentoRepositorio.query(query, params);      
      return this.responseService.success(resultado,  "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async listaDocumentos(data: ListaDocumentoDto) {
    try { 
    ;      
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
      const params : any[]  = [data.id_obra];
      if(data.id_tipo_documento!== null) 
      { params.push(data.id_tipo_documento);}
      const resultado: any[] = await this.documentoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async listaDocumentosXObraConAdjunto(data: ListaDocumentoDto) {
    try { 
    ;      
      let query = `SELECT * FROM public.documento as d
INNER JOIN public.tipo_documento as td ON d.id_tipo_documento = td.id_tipo_documento 
WHERE id_obra = $1 AND cumple = true AND d.id_estado = 1`;     
      const params : any[]  = [data.id_obra];
     
      const resultado: any[] = await this.documentoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async update(id: number, updateDocumentoDto: Partial<Documento>) {
    try {
      await this.documentoRepositorio.update(id, updateDocumentoDto);
      return this.responseService.success({}, 'Documento actualizado correctamente.');
    } catch (error) {
      return this.responseService.error(error, 'Error al actualizar el documento.');
    }
  }
  



  
}
