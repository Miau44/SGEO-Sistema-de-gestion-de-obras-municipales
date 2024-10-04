import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Parametrica } from './entities/parametrica.entity';
import { ParametricaService } from './services/parametrica.service';
import { ParametricaController } from './controllers/parametrica.controller';
import { ListaParametrica } from './entities/lista_parametrica.entity';
import { ListaParametricaService } from './services/lista_parametrica.service';
import { ListaParametricaController } from './controllers/lista_parametrica.controller';
import { ResponseService } from 'src/response.service';

@Module({

  imports: [TypeOrmModule.forFeature([Parametrica, ListaParametrica])],
  controllers: [ParametricaController, ListaParametricaController],
  providers: [ParametricaService, ListaParametricaService, ResponseService],
})
export class ParametricaModule {}
