import { Module } from '@nestjs/common';
import { ParametricaService } from './parametrica.service';
import { ParametricaController } from './parametrica.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Parametrica } from './entities/parametrica.entity';
import { ResponseService } from 'src/response.service';

@Module({

  imports: [TypeOrmModule.forFeature([Parametrica])],

  controllers: [ParametricaController],
  providers: [ParametricaService, ResponseService],
})
export class ParametricaModule {}
