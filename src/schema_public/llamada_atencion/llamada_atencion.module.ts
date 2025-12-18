import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LlamadaAtencion } from './entities/llamada_atencion.entity';
import { LlamadaAtencionService } from './llamada_atencion.service';
import { LlamadaAtencionController } from './llamada_atencion.controller';

import { ResponseService } from 'src/response.service';
import { CorrelativoModule } from '../correlativo/correlativo.module';
import { Memorandum } from '../memorandum/entities/memorandum.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LlamadaAtencion, Memorandum]),
    CorrelativoModule,
  ],
  
  controllers: [LlamadaAtencionController],
  providers: [LlamadaAtencionService, ResponseService],
})
export class LlamadaAtencionModule {}
