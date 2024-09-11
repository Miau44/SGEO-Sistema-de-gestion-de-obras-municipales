import { Injectable } from '@nestjs/common';
import { CreateFlujoDto } from './dto/create-flujo.dto';
import { UpdateFlujoDto } from './dto/update-flujo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { Flujo } from './entities/flujo.entity';
import { ResponseService } from 'src/response.service';
import { NotFoundException } from '@nestjs/common';



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

  async findAll() {
    try {
      const resultado = await this.flujoRepo.find();  
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  
  findOne(id: number) {
    return `This action returns a #${id} flujo`;
  }

  async  update(id: number, updateFlujoDto: UpdateFlujoDto) {
      try {
        const resultado = await this.flujoRepo.update(id, updateFlujoDto)  
        return this.responseService.success(id, "Actualizado Correctamente.")
      } catch (error) {
        return this.responseService.error(error);
      }
    }

  remove(id: number) {
    return `This action removes a #${id} flujo`;
  }


  async eliminarFlujo(id: number): Promise<void> {
    const resultado = await this.flujoRepo.delete(id);

    if (resultado.affected === 0) {
      throw new NotFoundException(`Flujo con ID ${id} no encontrado`);
    }
  }


  
}
