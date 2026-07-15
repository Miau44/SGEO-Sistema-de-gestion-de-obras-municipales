import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comunicado } from './entities/comunicado.entity';
import { CreateComunicadoDto } from './dto/create-comunicado.dto';
import { UpdateComunicadoDto } from './dto/update-comunicado.dto';

@Injectable()
export class ComunicadoService {
  constructor(
    @InjectRepository(Comunicado)
    private comunicadoRepository: Repository<Comunicado>,
  ) {}
  
  async create(createComunicadoDto: CreateComunicadoDto): Promise<Comunicado> {
    const nuevoComunicado = this.comunicadoRepository.create(createComunicadoDto);
    return await this.comunicadoRepository.save(nuevoComunicado);
  }

  async findAll(): Promise<Comunicado[]> {
    return await this.comunicadoRepository.find({
      order: {
        id_comunicado: 'DESC' 
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} comunicado`;
  }

  async update(id: number, updateComunicadoDto: any): Promise<any> {
    await this.comunicadoRepository.update(id, updateComunicadoDto);
    return { 
      statusCode: 200,
      message: `El comunicado #${id} fue actualizado correctamente` 
    };
  }

  remove(id: number) {
    return `This action removes a #${id} comunicado`;
  }
}
