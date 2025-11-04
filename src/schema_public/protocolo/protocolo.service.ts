import { Injectable } from '@nestjs/common';
import { CreateProtocoloDto } from './dto/create-protocolo.dto';
import { UpdateProtocoloDto } from './dto/update-protocolo.dto';

@Injectable()
export class ProtocoloService {
  create(createProtocoloDto: CreateProtocoloDto) {
    return 'This action adds a new protocolo';
  }

  findAll() {
    return `This action returns all protocolo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} protocolo`;
  }

  update(id: number, updateProtocoloDto: UpdateProtocoloDto) {
    return `This action updates a #${id} protocolo`;
  }

  remove(id: number) {
    return `This action removes a #${id} protocolo`;
  }
}
