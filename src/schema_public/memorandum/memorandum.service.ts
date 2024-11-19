import { Injectable } from '@nestjs/common';
import { CreateMemorandumDto } from './dto/create-memorandum.dto';
import { UpdateMemorandumDto } from './dto/update-memorandum.dto';

@Injectable()
export class MemorandumService {
  create(createMemorandumDto: CreateMemorandumDto) {
    return 'This action adds a new memorandum';
  }

  findAll() {
    return `This action returns all memorandum`;
  }

  findOne(id: number) {
    return `This action returns a #${id} memorandum`;
  }

  update(id: number, updateMemorandumDto: UpdateMemorandumDto) {
    return `This action updates a #${id} memorandum`;
  }

  remove(id: number) {
    return `This action removes a #${id} memorandum`;
  }
}
