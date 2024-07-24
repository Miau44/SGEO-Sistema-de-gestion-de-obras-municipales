import { Injectable } from '@nestjs/common';
import { CreateInstanciaFlujoDto } from './dto/create-instancia_flujo.dto';
import { UpdateInstanciaFlujoDto } from './dto/update-instancia_flujo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { InstanciaFlujo } from './entities/instancia_flujo.entity';



@Injectable()
export class InstanciaFlujoService {

  constructor(@InjectRepository(InstanciaFlujo) private insflujoRepo:Repository<InstanciaFlujo>, 
  private responseService: ResponseService)
{}
 
  async create(createInstanciaFlujoDto: CreateInstanciaFlujoDto) {

    try {
      const resultado = await this.insflujoRepo.save(createInstanciaFlujoDto);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }    
   
  }

  findAll() {
    return `This action returns all instanciaFlujo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} instanciaFlujo`;
  }

  update(id: number, updateInstanciaFlujoDto: UpdateInstanciaFlujoDto) {
    return `This action updates a #${id} instanciaFlujo`;
  }

  remove(id: number) {
    return `This action removes a #${id} instanciaFlujo`;
  }
}
