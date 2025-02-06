import { Module } from '@nestjs/common';
import { CorrelativoService } from './correlativo.service';
import { CorrelativoController } from './correlativo.controller';
import { Correlativo } from './entities/correlativo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memorandum } from '../memorandum/entities/memorandum.entity';
import { ResponseService } from 'src/response.service';
import { ConfigModule } from '@nestjs/config';
import { Informe } from '../informe/entities/informe.entity';

@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true
  }), 
  TypeOrmModule.forFeature([Correlativo, Memorandum, Informe])],

  controllers: [CorrelativoController],
  providers: [CorrelativoService, ResponseService],
})
export class CorrelativoModule {}
