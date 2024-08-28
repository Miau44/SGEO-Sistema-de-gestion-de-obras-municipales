import { Injectable } from '@nestjs/common';
import { CreateTipoInformeDto } from './dto/create-tipo_informe.dto';
import { UpdateTipoInformeDto } from './dto/update-tipo_informe.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { TipoInforme } from './entities/tipo_informe.entity';
import { ResponseService } from 'src/response.service';



@Injectable()
export class TipoInformeService {
 
  constructor(@InjectRepository(TipoInforme) private tipoInformeRepositorio: Repository<TipoInforme>,
    private responseService: ResponseService,
  ) { }


  async create(createTipoInformeDto: CreateTipoInformeDto) {
    try {
      const resultado = await this.tipoInformeRepositorio.save(createTipoInformeDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async findAll() {
    try {
      const resultado = await this.tipoInformeRepositorio.find()
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoInforme`;
  }

  update(id: number, updateTipoInformeDto: UpdateTipoInformeDto) {
    return `This action updates a #${id} tipoInforme`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoInforme`;
  }
}
