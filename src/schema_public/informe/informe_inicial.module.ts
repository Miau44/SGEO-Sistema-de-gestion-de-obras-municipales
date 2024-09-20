import { Module } from '@nestjs/common';
import { InformeInicialService } from './informe_inicial.service';
import { InformeInicialController } from './informe_inicial.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Informe } from './entities/informe_inicial.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Informe])],

  controllers: [InformeInicialController],
  providers: [InformeInicialService, ResponseService],
})
export class InformeInicialModule {}
