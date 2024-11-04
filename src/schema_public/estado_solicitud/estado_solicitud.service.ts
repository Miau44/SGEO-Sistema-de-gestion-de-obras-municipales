import { Injectable } from '@nestjs/common';
import { CreateEstadoSolicitudDto } from './dto/create-estado_solicitud.dto';
import { UpdateEstadoSolicitudDto } from './dto/update-estado_solicitud.dto';

@Injectable()
export class EstadoSolicitudService {
  create(createEstadoSolicitudDto: CreateEstadoSolicitudDto) {
    return 'This action adds a new estadoSolicitud';
  }

  findAll() {
    return `This action returns all estadoSolicitud`;
  }

  findOne(id: number) {
    return `This action returns a #${id} estadoSolicitud`;
  }

  update(id: number, updateEstadoSolicitudDto: UpdateEstadoSolicitudDto) {
    return `This action updates a #${id} estadoSolicitud`;
  }

  remove(id: number) {
    return `This action removes a #${id} estadoSolicitud`;
  }
}
