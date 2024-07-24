import { Injectable } from '@nestjs/common';
import { CreateCorrelativoMemoDto } from './dto/create-correlativo_memo.dto';
import { UpdateCorrelativoMemoDto } from './dto/update-correlativo_memo.dto';

@Injectable()
export class CorrelativoMemoService {
  create(createCorrelativoMemoDto: CreateCorrelativoMemoDto) {
    return 'This action adds a new correlativoMemo';
  }

  findAll() {
    return `This action returns all correlativoMemo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} correlativoMemo`;
  }

  update(id: number, updateCorrelativoMemoDto: UpdateCorrelativoMemoDto) {
    return `This action updates a #${id} correlativoMemo`;
  }

  remove(id: number) {
    return `This action removes a #${id} correlativoMemo`;
  }
}
