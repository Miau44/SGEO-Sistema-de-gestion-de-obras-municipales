import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { ResponseService } from 'src/response.service';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { ListaDocumentoDto } from './dto/listaDocumento.dto';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import axios from 'axios';
import { DocumentoObraDto } from './dto/documento_obra.dto';

@Injectable()
export class DocumentoService {

  private readonly uploadUrl: string;

  constructor(
    @InjectRepository(Documento) private documentoRepositorio: Repository<Documento>,
    private responseService: ResponseService,
    private configService: ConfigService
  ) {
    this.uploadUrl = this.configService.get<string>('WEB_UPLOAD_URL') || 'http://192.168.8.4:3300/documento/saveFile';
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
    fileExtension: string
  ): Promise<string> {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const formattedDate = fecha.toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = Date.now().toString().slice(-6);

    const ruta = `${year}/${id_obra}/${id_tipo_documento}/${id_obra}_${id_tipo_documento}_${formattedDate}_${timestamp}.${fileExtension}`;
    return ruta;
  }

  async createDocumento(documento: Documento): Promise<Documento> {
    return await this.documentoRepositorio.save(documento);
  }

  async saveDocumentoUrl(id_documento: number, url_file: string): Promise<void> {
    await this.documentoRepositorio.update(id_documento, { ruta_documento: url_file });
  }

  async uploadFileToExternalService(
    file: Express.Multer.File,
    ruta: string,
    resumen: string,
    palabraClave: string,
    usuario: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);
      formData.append('sistema', 'SICOM'); // Valor fijo
      formData.append('ruta', ruta);
      formData.append('resumen', resumen);
      formData.append('palabraClave', palabraClave);
      formData.append('usuario', usuario);

      const response = await axios.post(this.uploadUrl, formData, {
        headers: formData.getHeaders(),
      });

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al enviar el archivo: ${(error as Error).message}`,
        HttpStatus.BAD_GATEWAY
      );
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
    LEFT OUTER JOIN  public.vista_documentos as d ON td.id_tipo_documento=d.id_tipo_documento AND d.id_obra = $1	`;
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
      let query = `		SELECT  td.id_tipo_documento, td.desc_tipo_documento, sub.desc_subtipo AS sistema, 
    td.id_subtipo_documento, td.id_etapa_documento,
    d.id_documento, d.id_obra , d.fecha_registro, d.usuario_registro, d.cumple,  d.ruta_documento
    FROM  tipo_documento as td
    INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
    INNER  JOIN  documento as d ON td.id_tipo_documento=d.id_tipo_documento 
    AND d.id_obra = $1	
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


  
}
