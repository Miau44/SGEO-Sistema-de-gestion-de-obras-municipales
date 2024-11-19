import { Module } from '@nestjs/common';
import { MemorandumService } from './memorandum.service';
import { MemorandumController } from './memorandum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memorandum } from './entities/memorandum.entity';
import { Obra } from '../obra/entities/obra.entity';
import { CorrelativoMemo } from '../correlativo_memo/entities/correlativo_memo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Memorandum, Obra, CorrelativoMemo])],

  controllers: [MemorandumController],
  providers: [MemorandumService],
})
export class MemorandumModule {}
