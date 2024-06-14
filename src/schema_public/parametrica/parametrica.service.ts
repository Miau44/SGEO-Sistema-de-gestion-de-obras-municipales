import { Injectable } from '@nestjs/common';
import { CreateParametricaDto } from './dto/create-parametrica.dto';
import { UpdateParametricaDto } from './dto/update-parametrica.dto';
import { Parametrica } from './entities/parametrica.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Not, Repository } from 'typeorm';



@Injectable()
export class ParametricaService {


  constructor( @InjectRepository(Parametrica) private parametricaRepo: Repository<Parametrica>)
  {}

  create(createParametricaDto: CreateParametricaDto) {
    return  this.parametricaRepo.save(createParametricaDto)
  }

  findAll() {
    return `This action returns all parametrica`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parametrica`;
  }

  update(id: number, updateParametricaDto: UpdateParametricaDto) {
    return `This action updates a #${id} parametrica`;
  }

  remove(id: number) {
    return `This action removes a #${id} parametrica`;
  }
}
