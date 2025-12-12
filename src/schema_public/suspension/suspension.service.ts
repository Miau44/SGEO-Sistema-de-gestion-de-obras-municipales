import { Injectable } from '@nestjs/common';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { UpdateSuspensionDto } from './dto/update-suspension.dto';

@Injectable()
export class SuspensionService {
  create(createSuspensionDto: CreateSuspensionDto) {
    return 'This action adds a new suspension';
  }

  findAll() {
    return `This action returns all suspension`;
  }

  findOne(id: number) {
    return `This action returns a #${id} suspension`;
  }

  update(id: number, updateSuspensionDto: UpdateSuspensionDto) {
    return `This action updates a #${id} suspension`;
  }

  remove(id: number) {
    return `This action removes a #${id} suspension`;
  }
}
