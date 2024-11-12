import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoModificatorio } from './entities/contrato-modificatorio.entity';
import { ContratoModificatorioController } from './contrato-modificatorio.controller';
import { ContratoModificatorioService } from './contrato-modificatorio.service';


@Module({
  imports: [TypeOrmModule.forFeature([ContratoModificatorio])],
  providers: [ContratoModificatorioService],
  controllers: [ContratoModificatorioController]
})
export class ContratoModificatorioModule {}
