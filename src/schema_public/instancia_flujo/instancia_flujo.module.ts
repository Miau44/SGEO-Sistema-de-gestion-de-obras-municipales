import { Module } from '@nestjs/common';
import { InstanciaFlujoService } from './instancia_flujo.service';
import { InstanciaFlujoController } from './instancia_flujo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { InstanciaFlujo } from './entities/instancia_flujo.entity';
import { InstanciaTarea } from '../instancia_tarea/entities/instancia_tarea.entity';
import { Transicion } from '../transicion/entities/transicion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstanciaFlujo, InstanciaTarea, Transicion ])],

  controllers: [InstanciaFlujoController],
  providers: [InstanciaFlujoService, ResponseService],
})
export class InstanciaFlujoModule {}
