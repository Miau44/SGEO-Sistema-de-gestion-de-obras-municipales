import { Injectable } from '@nestjs/common';
import { CreateParametricaDto } from './dto/create-parametrica.dto';
import { UpdateParametricaDto } from './dto/update-parametrica.dto';
import { Parametrica } from './entities/parametrica.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Not, Repository } from 'typeorm';
import { FiltrosDto } from './dto/filtrosDto.dto';
import { ResponseService } from 'src/response.service';



@Injectable()
export class ParametricaService {

  constructor(@InjectRepository(Parametrica) private parametricaRepo: Repository<Parametrica>
    , private responseSevice: ResponseService) { }

  create(createParametricaDto: CreateParametricaDto) {
    try {
      const resultado = this.parametricaRepo.save(createParametricaDto)
      return this.responseSevice.success(resultado, "Registrado Correctamente")
    } catch (error) {
      return this.responseSevice.error(error);
    }

  }

  async findAll() {
    try {
      const resultado = await this.parametricaRepo.find()
      return this.responseSevice.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseSevice.error(error);
    }
  }

  async findOne(id: number) {
    try {
      const resultado = await this.parametricaRepo.findOneBy({ id });
      return this.responseSevice.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseSevice.error(error);
    }
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

  async listarXTipo(filtrosDto: FiltrosDto): Promise<any> {
    try {
      const query = ` SELECT * FROM parametrica WHERE ${filtrosDto.campo} = $1 AND id_estado=1; `;
      const values = [filtrosDto.id];
      const resultado = await this.parametricaRepo.query(query, values);
      return this.responseSevice.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseSevice.error(error);
    }
  }






}
