import { Injectable } from '@nestjs/common';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { ResponseService } from 'src/response.service';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';

@Injectable()
export class DocumentoService {
  constructor(
    @InjectRepository(Documento) private documentoRepositorio: Repository<Documento>,
    private responseService: ResponseService

  ) { } 

  async create(createDocumentoDto: CreateDocumentoDto) {
    try {
      const resultado = await this.documentoRepositorio.save(createDocumentoDto);
      return this.responseService.success(resultado, "Guardado Correctamente.")
        } catch (error) {
          return this.responseService.error(error);
        }      
  }

  findAll() {
    return `This action returns all documento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} documento`;
  }

  update(id: number, updateDocumentoDto: UpdateDocumentoDto) {
    return `This action updates a #${id} documento`;
  }

  remove(id: number) {
    return `This action removes a #${id} documento`;
  }


  async documentosXObra(id_obra:number) {
    try {
      const query1 = `
    SELECT  td.id_tipo_documento, td.desc_tipo_documento, sub.desc_subtipo AS sistema, 
    td.id_subtipo_documento, td.id_etapa_documento,
    d.id_documento, d.id_obra , d.fecha_registro, d.usuario_registro, d.cumple,  d.ruta_documento
    FROM  tipo_documento as td
    INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
    LEFT OUTER JOIN  documento as d ON td.id_tipo_documento=d.id_tipo_documento AND d.id_obra = $1	
    ORDER BY td.id_tipo_documento ASC `;
      const params = [id_obra];  
     const resultado = await this.documentoRepositorio.query(query1, params);      
      return this.responseService.success(resultado,  "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
}
