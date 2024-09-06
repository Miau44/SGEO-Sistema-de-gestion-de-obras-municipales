import { Injectable } from '@nestjs/common';
import { CreateTransicionDto } from './dto/create-transicion.dto';
import { UpdateTransicionDto } from './dto/update-transicion.dto';
import { ResponseService } from 'src/response.service';
import { And, Any, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transicion } from './entities/transicion.entity';


@Injectable()
export class TransicionService {

  constructor(@InjectRepository(Transicion) private transicionRepo: Repository<Transicion>,
  private responseService: ResponseService) 
  
  { }

  async create(createTransicionDto: CreateTransicionDto) {
    try {
      const resultado = await this.transicionRepo.save(createTransicionDto);

      return this.responseService.success(resultado, "Guardado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  findAll() {
    return `This action returns all transicion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transicion`;
  }

  update(id: number, updateTransicionDto: UpdateTransicionDto) {
    return `This action updates a #${id} transicion`;
  }

  remove(id: number) {
    return `This action removes a #${id} transicion`;
  }
}
