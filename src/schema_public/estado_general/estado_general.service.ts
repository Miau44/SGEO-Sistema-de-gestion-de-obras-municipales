import { Injectable } from '@nestjs/common';
import { CreateEstadoGeneralDto } from './dto/create-estado_general.dto';
import { UpdateEstadoGeneralDto } from './dto/update-estado_general.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoGeneral } from './entities/estado_general.entity';

@Injectable()
export class EstadoGeneralService {
  constructor(
    @InjectRepository(EstadoGeneral)
    private estadoGeneralRepo: Repository<EstadoGeneral>,
  ) {}


  async create(createEstadoGeneralDto: CreateEstadoGeneralDto) {
    const nuevo = this.estadoGeneralRepo.create(createEstadoGeneralDto);
    return await this.estadoGeneralRepo.save(nuevo);
  }
  
  /*create(createEstadoGeneralDto: CreateEstadoGeneralDto) {
    return 'This action adds a new estadoGeneral';
  }*/

  findAll() {
    return `This action returns all estadoGeneral`;
  }

  findOne(id: number) {
    return `This action returns a #${id} estadoGeneral`;
  }

  update(id: number, updateEstadoGeneralDto: UpdateEstadoGeneralDto) {
    return `This action updates a #${id} estadoGeneral`;
  }

  remove(id: number) {
    return `This action removes a #${id} estadoGeneral`;
  }
}
