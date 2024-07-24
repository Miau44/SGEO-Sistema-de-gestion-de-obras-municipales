import { Injectable } from '@nestjs/common';
import { CreateDesignacionDto } from './dto/create-designacion.dto';
import { UpdateDesignacionDto } from './dto/update-designacion.dto';
import { And, Any, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { Designacion } from './entities/designacion.entity';


@Injectable()
export class DesignacionService {

constructor(@InjectRepository(Designacion)
private desginacionRepositorio:Repository<Designacion>,
private responseService:ResponseService) {}

 async create(createDesignacionDto: CreateDesignacionDto) {
  try {  
    const resultado = await this.desginacionRepositorio.save(createDesignacionDto);
    return this.responseService.success(resultado, "Guardado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }    
  }

  findAll() {
    return `This action returns all designacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} designacion`;
  }

  update(id: number, updateDesignacionDto: UpdateDesignacionDto) {
    return `This action updates a #${id} designacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} designacion`;
  }
}
