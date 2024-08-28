import { Module } from '@nestjs/common';
import { TipoInformeService } from './tipo_informe.service';
import { TipoInformeController } from './tipo_informe.controller';
import { ResponseService } from 'src/response.service';
import { TipoInforme } from './entities/tipo_informe.entity';
import { TypeOrmModule } from '@nestjs/typeorm';



@Module({
  imports: [TypeOrmModule.forFeature([TipoInforme])],

  controllers: [TipoInformeController],
  providers: [TipoInformeService, ResponseService],
})
export class TipoInformeModule {}
