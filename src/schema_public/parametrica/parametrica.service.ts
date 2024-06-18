import { Injectable } from '@nestjs/common';
import { CreateParametricaDto } from './dto/create-parametrica.dto';
import { UpdateParametricaDto } from './dto/update-parametrica.dto';
import { Parametrica } from './entities/parametrica.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Not, Repository } from 'typeorm';
import { FiltrosDto } from './dto/filtrosDto.dto';
import { log } from 'console';



@Injectable()
export class ParametricaService {


  constructor(@InjectRepository(Parametrica) private parametricaRepo: Repository<Parametrica>) { }

  create(createParametricaDto: CreateParametricaDto) {
    return  this.parametricaRepo.save(createParametricaDto)
  }

  findAll() {
    return this.parametricaRepo.find()
  }

  findOne(id: number) {
    return this.parametricaRepo.findOneBy({ id });
  }

  update(id: number, updateParametricaDto: UpdateParametricaDto) {
    try {
      return this.parametricaRepo.update(id, updateParametricaDto)
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
        data: id,
      };
    }
  }

remove(id: number) {
  return `This action removes a #${id} parametrica`;
}

async listarXTipo(filtrosDto:FiltrosDto): Promise<any> {
  try{
  const query = ` SELECT * FROM parametrica WHERE ${filtrosDto.campo} = $1; `; 
  const values = [filtrosDto.id];  
  const resultado = await this.parametricaRepo.query(query, values);
  return {
    statusCode: 200,
    message: true,
    data: resultado
  };
  }
 catch (error) {
  return {
    statusCode: 500,
    message: false,
  };
 } 
}






}
