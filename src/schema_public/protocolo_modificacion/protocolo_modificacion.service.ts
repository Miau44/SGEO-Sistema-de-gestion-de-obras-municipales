import { Injectable } from '@nestjs/common';
import { CreateProtocoloModificacionDto } from './dto/create-protocolo_modificacion.dto';
import { UpdateProtocoloModificacionDto } from './dto/update-protocolo_modificacion.dto';

@Injectable()
export class ProtocoloModificacionService {
  create(createProtocoloModificacionDto: CreateProtocoloModificacionDto) {
    return 'This action adds a new protocoloModificacion';
  }

  findAll() {
    return `This action returns all protocoloModificacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} protocoloModificacion`;
  }

  update(id: number, updateProtocoloModificacionDto: UpdateProtocoloModificacionDto) {
    return `This action updates a #${id} protocoloModificacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} protocoloModificacion`;
  }
}
