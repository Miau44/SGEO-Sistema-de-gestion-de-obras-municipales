import { Module } from '@nestjs/common';
import { DesignacionService } from './designacion.service';
import { DesignacionController } from './designacion.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Obra } from '../obra/entities/obra.entity';
import { ConfigModule } from '@nestjs/config';
//import { CorrelativoMemo } from '../correlativo_memo/entities/correlativo_memo.entity';
import { Correlativo } from '../correlativo/entities/correlativo.entity';
import { Designacion } from './entities/designacion.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { PersonapermisoUe } from '../personapermiso_ue/entities/personapermiso_ue.entity';


@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true
  }),
  TypeOrmModule.forFeature([Designacion, Obra, Correlativo, Solicitud, PersonapermisoUe])],

  controllers: [DesignacionController],
  providers: [DesignacionService, ResponseService],
})
export class DesignacionModule {}
