import { Injectable } from '@nestjs/common';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { ResponseService } from 'src/response.service';
import { And, Any, Not, Repository } from 'typeorm';
import { Tarea } from './entities/tarea.entity';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class TareaService {
  constructor(@InjectRepository(Tarea) private tareaRepo: Repository<Tarea>,
  private responseService: ResponseService) 
  
  { }


  async create(createTareaDto: CreateTareaDto) {
    try {
      const resultado = await this.tareaRepo.save(createTareaDto);

      return this.responseService.success(resultado, "Guardado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all tarea`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tarea`;
  }

  update(id: number, updateTareaDto: UpdateTareaDto) {
    return `This action updates a #${id} tarea`;
  }

  remove(id: number) {
    return `This action removes a #${id} tarea`;
  }
}
