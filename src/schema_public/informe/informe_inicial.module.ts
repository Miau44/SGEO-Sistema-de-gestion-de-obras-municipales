import { Module } from '@nestjs/common';
import { InformeService } from './informe_inicial.service';
import { InformeController } from './informe_inicial.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Informe } from './entities/informe.entity';
import { InformeInicial } from './entities/informe_inicial.entity';
import { Correlativo } from '../correlativo/entities/correlativo.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Informe, InformeInicial, Correlativo])],

  controllers: [InformeController],
  providers: [InformeService, ResponseService],
})
export class InformeInicialModule {}
