import { Injectable } from '@nestjs/common';
import { CreateInstanciaTareaDto } from './dto/create-instancia_tarea.dto';
import { UpdateInstanciaTareaDto } from './dto/update-instancia_tarea.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { InstanciaTarea } from './entities/instancia_tarea.entity';

@Injectable()
export class InstanciaTareaService {

constructor(@InjectRepository(InstanciaTarea) private instareaRepo:Repository<InstanciaTarea>,
private responseService:ResponseService){}

 async  create(createInstanciaTareaDto: CreateInstanciaTareaDto) {
    try {
      const resultado = await this.instareaRepo.save(createInstanciaTareaDto);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }    
  }

  findAll() {
    return `This action returns all instanciaTarea`;
  }

  findOne(id: number) {
    return `This action returns a #${id} instanciaTarea`;
  }

  update(id: number, updateInstanciaTareaDto: UpdateInstanciaTareaDto) {
    return `This action updates a #${id} instanciaTarea`;
  }

  remove(id: number) {
    return `This action removes a #${id} instanciaTarea`;
  }
}
