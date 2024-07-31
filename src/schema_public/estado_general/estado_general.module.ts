import { Module } from '@nestjs/common';
import { EstadoGeneralService } from './estado_general.service';
import { EstadoGeneralController } from './estado_general.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { EstadoGeneral } from './entities/estado_general.entity';



@Module({
  imports: [TypeOrmModule.forFeature([EstadoGeneral])],

  controllers: [EstadoGeneralController],
  providers: [EstadoGeneralService],
})
export class EstadoGeneralModule {}
