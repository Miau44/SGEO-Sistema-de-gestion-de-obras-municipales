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
}
