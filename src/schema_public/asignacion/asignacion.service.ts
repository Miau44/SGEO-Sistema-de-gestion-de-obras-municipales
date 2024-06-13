import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { Asignacion } from './entities/asignacion.entity';

@Injectable()
export class AsignacionService {

  constructor(
    @InjectRepository(Asignacion) private asignacionRepositorio: Repository<Asignacion>,
  ) {}


  create(createAsignacionDto: CreateAsignacionDto) {
    return this.asignacionRepositorio.save(createAsignacionDto)
  }

  findAll() {
    return `This action returns all asignacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asignacion`;
  }

  update(id: number, updateAsignacionDto: UpdateAsignacionDto) {
    return `This action updates a #${id} asignacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} asignacion`;
  }
}
