import { Injectable } from '@nestjs/common';
import { CreateSolicitudEstadoDto } from './dto/create-solicitud_estado.dto';
import { UpdateSolicitudEstadoDto } from './dto/update-solicitud_estado.dto';

@Injectable()
export class SolicitudEstadoService {
  create(createSolicitudEstadoDto: CreateSolicitudEstadoDto) {
    return 'This action adds a new solicitudEstado';
  }

  findAll() {
    return `This action returns all solicitudEstado`;
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitudEstado`;
  }

  update(id: number, updateSolicitudEstadoDto: UpdateSolicitudEstadoDto) {
    return `This action updates a #${id} solicitudEstado`;
  }

  remove(id: number) {
    return `This action removes a #${id} solicitudEstado`;
  }
}
