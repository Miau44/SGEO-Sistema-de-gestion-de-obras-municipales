import { Module } from '@nestjs/common';
import { CorrelativoMemoService } from './correlativo_memo.service';
import { CorrelativoMemoController } from './correlativo_memo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrelativoMemo } from './entities/correlativo_memo.entity';
import { Memorandum } from '../memorandum/entities/memorandum.entity';

@Module({

  imports: [TypeOrmModule.forFeature([CorrelativoMemo, Memorandum])],

  controllers: [CorrelativoMemoController],
  providers: [CorrelativoMemoService],
})
export class CorrelativoMemoModule {}
