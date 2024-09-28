import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListaTablaService } from './lista_tabla.service';
import { ListaTablaController } from './lista_tabla.controller';
import { ListaTabla } from './entities/lista_tabla.entity';
import { ResponseService } from 'src/response.service';

@Module({
  imports: [TypeOrmModule.forFeature([ListaTabla])],
  providers: [ListaTablaService, ResponseService],
  controllers: [ListaTablaController]
})
export class ListaTablaModule {}
