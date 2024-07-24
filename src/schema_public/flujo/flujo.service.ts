import { Injectable } from '@nestjs/common';
import { CreateFlujoDto } from './dto/create-flujo.dto';
import { UpdateFlujoDto } from './dto/update-flujo.dto';

@Injectable()
export class FlujoService {
  create(createFlujoDto: CreateFlujoDto) {
    return 'This action adds a new flujo';
  }

  findAll() {
    return `This action returns all flujo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flujo`;
  }

  update(id: number, updateFlujoDto: UpdateFlujoDto) {
    return `This action updates a #${id} flujo`;
  }

  remove(id: number) {
    return `This action removes a #${id} flujo`;
  }
}
