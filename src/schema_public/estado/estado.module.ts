import { Module } from '@nestjs/common';
import { EstadoService } from './estado.service';
import { EstadoController } from './estado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estado } from './entities/estado.entity';
import { GarantiaSeguro } from '../garantia_seguro/entities/garantia_seguro.entity';
import { Empresa } from '../empresa/entities/empresa.entity';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([Estado, GarantiaSeguro, Empresa])], 
  controllers: [EstadoController],
  providers: [EstadoService],
})
export class EstadoModule {}
