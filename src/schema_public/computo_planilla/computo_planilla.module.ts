import { Module } from '@nestjs/common';
import { ComputoPlanillaService } from './computo_planilla.service';
import { ComputoPlanillaController } from './computo_planilla.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Computo } from './entities/computo.entity';
import { Planilla } from '../planilla/entities/planilla.entity';
import { PlanillaService } from '../planilla/planilla.service';

import { ComputoCriterio } from './entities/computo_criterio.entity';


@Module({

  imports: [ 
    TypeOrmModule.forFeature([Computo,  ComputoCriterio, Planilla])],  

  controllers: [ComputoPlanillaController],
  providers: [ComputoPlanillaService, ResponseService, PlanillaService],
})
export class ComputoPlanillaModule {}
