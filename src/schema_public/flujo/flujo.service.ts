import { Injectable } from '@nestjs/common';
import { CreateFlujoDto } from './dto/create-flujo.dto';
import { UpdateFlujoDto } from './dto/update-flujo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { Flujo } from './entities/flujo.entity';
import { ResponseService } from 'src/response.service';



@Injectable()
export class FlujoService {

  constructor(@InjectRepository(Flujo) private flujoRepo: Repository<Flujo>,
    private responseService: ResponseService)     
    { }

 async create(createFlujoDto: CreateFlujoDto) {
    try {
      const resultado = await this.flujoRepo.save(createFlujoDto);
      return this.responseService.success(resultado, "Guardado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all flujo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flujo`;
  }

  update(id: number, updateFlujoDto: UpdateFlujoDto) {
    return `This action updates a #${id} flujo`;
  }

  remove(id: number) {
    return `This action removes a #${id} flujo`;
  }
}
