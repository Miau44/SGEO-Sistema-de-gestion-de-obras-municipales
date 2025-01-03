import { Module } from '@nestjs/common';
import { ComputoPlanillaService } from './computo_planilla.service';
import { ComputoPlanillaController } from './computo_planilla.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Computo } from './entities/computo.entity';


@Module({

  imports: [ 
    TypeOrmModule.forFeature([Computo])],  

  controllers: [ComputoPlanillaController],
  providers: [ComputoPlanillaService, ResponseService],
})
export class ComputoPlanillaModule {}
