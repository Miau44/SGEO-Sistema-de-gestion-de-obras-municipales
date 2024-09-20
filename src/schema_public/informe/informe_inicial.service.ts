import { Injectable } from '@nestjs/common';
import { CreateInformeInicialDto } from './dto/create-informe_inicial.dto';
import { UpdateInformeInicialDto } from './dto/update-informe_inicial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { Informe } from './entities/informe_inicial.entity';
import { ResponseService } from 'src/response.service';


@Injectable()
export class InformeInicialService {

  constructor(@InjectRepository(Informe) private infInicialRepositorio: Repository<Informe>,
    private responseService: ResponseService,
  ) { }

  async create(createInformeInicialDto: CreateInformeInicialDto) {
    try {
      const resultado = await this.infInicialRepositorio.save(createInformeInicialDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async findAll() {
    try {
      const resultado = await this.infInicialRepositorio.find()
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

 

  async findOne(id_informe: number) {
    try {    
      const resultado  = await this.infInicialRepositorio.findOneBy({ id_informe});
      return this.responseService.success(resultado, "Listado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }      
  }

  update(id: number, updateInformeInicialDto: UpdateInformeInicialDto) {
    try {
    return this.infInicialRepositorio.update(+id, updateInformeInicialDto);
  } catch (error) {
    return this.responseService.error(error);
  }    
  }

  remove(id: number) {
    return `This action removes a #${id} informeInicial`;
  }
}
