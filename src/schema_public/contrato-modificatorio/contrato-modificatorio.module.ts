import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoModificatorio } from './entities/contrato-modificatorio.entity';
import { ContratoModificatorioController } from './contrato-modificatorio.controller';
import { ContratoModificatorioService } from './contrato-modificatorio.service';
import { Ficha } from './../ficha/entities/ficha.entity';
import { Obra } from './../obra/entities/obra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContratoModificatorio,Ficha,Obra])],
  providers: [ContratoModificatorioService],
  controllers: [ContratoModificatorioController]
})
export class ContratoModificatorioModule {}
