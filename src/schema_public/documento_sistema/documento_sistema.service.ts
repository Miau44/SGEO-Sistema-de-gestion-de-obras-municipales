import { Injectable } from '@nestjs/common';
import { CreateDocumentoSistemaDto } from './dto/create-documento_sistema.dto';
import { UpdateDocumentoSistemaDto } from './dto/update-documento_sistema.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentoSistema } from './entities/documento_sistema.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DocumentoSistemaService {

  constructor(
    @InjectRepository(DocumentoSistema)
    private readonly documentoSistemaRepo: Repository<DocumentoSistema>,
  ) {}
  
  async create(createDocumentoSistemaDto: CreateDocumentoSistemaDto) {
    const nuevoRegistro = this.documentoSistemaRepo.create(createDocumentoSistemaDto);
    return await this.documentoSistemaRepo.save(nuevoRegistro);
  }
  
  findAll() {
    return `This action returns all documentoSistema`;
  }
  
  findOne(id: number) {
    return `This action returns a #${id} documentoSistema`;
  }

  async update(id: number, updateDocumentoSistemaDto: UpdateDocumentoSistemaDto) {
    await this.documentoSistemaRepo.update(id, updateDocumentoSistemaDto);
    return this.documentoSistemaRepo.findOneBy({ id_documento_sistema: id });
  }
  
  remove(id: number) {
    return `This action removes a #${id} documentoSistema`;
  }
}
