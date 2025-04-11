import { Module } from '@nestjs/common';
import { ObraService } from './obra.service';
import { ObraController } from './obra.controller';
import { ResponseService } from 'src/response.service';
import { Obra } from './entities/obra.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GarantiaSeguro } from '../garantia_seguro/entities/garantia_seguro.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { Memorandum } from '../memorandum/entities/memorandum.entity';




@Module({
  imports: [TypeOrmModule.forFeature([Obra, GarantiaSeguro, Empresa, Memorandum])],

  controllers: [ObraController],
  providers: [ObraService, ResponseService],
})
export class ObraModule {}
