import { Module } from '@nestjs/common';
import { CorrelativoMemoService } from './correlativo_memo.service';
import { CorrelativoMemoController } from './correlativo_memo.controller';

@Module({
  controllers: [CorrelativoMemoController],
  providers: [CorrelativoMemoService],
})
export class CorrelativoMemoModule {}
