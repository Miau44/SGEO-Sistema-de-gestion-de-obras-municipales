import { Module } from '@nestjs/common';
import { MemorandumService } from './memorandum.service';
import { MemorandumController } from './memorandum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memorandum } from './entities/memorandum.entity';
import { Obra } from '../obra/entities/obra.entity';
import { Correlativo } from '../correlativo/entities/correlativo.entity';
import { ResponseService } from 'src/response.service';
import { Informe } from '../informe/entities/informe.entity';
import { CorrelativoModule } from '../correlativo/correlativo.module';
import { Contrato } from '../contrato-modificatorio/entities/contrato.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Memorandum, Obra, Correlativo, Informe, Contrato]),
  CorrelativoModule, ],

  controllers: [MemorandumController],
  providers: [MemorandumService, ResponseService],
  exports:[MemorandumService]

})
export class MemorandumModule {}
