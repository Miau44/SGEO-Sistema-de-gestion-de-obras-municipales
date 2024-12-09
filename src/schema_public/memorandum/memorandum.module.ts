import { Module } from '@nestjs/common';
import { MemorandumService } from './memorandum.service';
import { MemorandumController } from './memorandum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memorandum } from './entities/memorandum.entity';
import { Obra } from '../obra/entities/obra.entity';
import { CorrelativoMemo } from '../correlativo_memo/entities/correlativo_memo.entity';
import { ResponseService } from 'src/response.service';
import { Informe } from '../informe/entities/informe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Memorandum, Obra, CorrelativoMemo, Informe])],

  controllers: [MemorandumController],
  providers: [MemorandumService,ResponseService],
})
export class MemorandumModule {}
