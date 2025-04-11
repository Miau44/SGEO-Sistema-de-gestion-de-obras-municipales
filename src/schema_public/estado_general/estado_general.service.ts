import { Injectable } from '@nestjs/common';
import { CreateEstadoGeneralDto } from './dto/create-estado_general.dto';
import { UpdateEstadoGeneralDto } from './dto/update-estado_general.dto';

@Injectable()
export class EstadoGeneralService {
  create(createEstadoGeneralDto: CreateEstadoGeneralDto) {
    return 'This action adds a new estadoGeneral';
  }

  findAll() {
    return `This action returns all estadoGeneral`;
  }

  findOne(id: number) {
    return `This action returns a #${id} estadoGeneral`;
  }

  update(id: number, updateEstadoGeneralDto: UpdateEstadoGeneralDto) {
    return `This action updates a #${id} estadoGeneral`;
  }

  remove(id: number) {
    return `This action removes a #${id} estadoGeneral`;
  }
}
