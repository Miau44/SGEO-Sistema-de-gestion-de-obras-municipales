import { Module } from '@nestjs/common';
import { PlanillaService } from './planilla.service';
import { PlanillaController } from './planilla.controller';
import { ResponseService } from 'src/response.service';
import { Planilla } from './entities/planilla.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ 
  TypeOrmModule.forFeature([Planilla])],   
  controllers: [PlanillaController],
  providers: [PlanillaService, ResponseService],
})
export class PlanillaModule {}
