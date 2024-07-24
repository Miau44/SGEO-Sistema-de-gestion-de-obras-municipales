import { Module } from '@nestjs/common';
import { InstanciaFlujoService } from './instancia_flujo.service';
import { InstanciaFlujoController } from './instancia_flujo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { InstanciaFlujo } from './entities/instancia_flujo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstanciaFlujo])],

  controllers: [InstanciaFlujoController],
  providers: [InstanciaFlujoService, ResponseService],
})
export class InstanciaFlujoModule {}
