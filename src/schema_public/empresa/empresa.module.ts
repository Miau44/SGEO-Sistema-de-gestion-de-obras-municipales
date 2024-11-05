import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Obra } from '../obra/entities/obra.entity';
<<<<<<< HEAD
=======

>>>>>>> 1a52034da5b48118d03f7761a7323d2662653b5f

@Module({
  imports: [ 
    TypeOrmModule.forFeature([Empresa, Obra])],
  controllers: [EmpresaController],
  providers: [EmpresaService],
})
export class EmpresaModule {}
