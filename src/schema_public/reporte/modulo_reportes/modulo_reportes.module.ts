import { Module } from '@nestjs/common';
import { ModuloReportesService } from './modulo_reportes.service';
import { ModuloReportesController } from './modulo_reportes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Computo } from 'src/schema_public/computo/entities/computo.entity';
import { ResponseService } from 'src/response.service';

@Module({
 imports: [ 
    TypeOrmModule.forFeature([Computo])],  

  controllers: [ModuloReportesController],
  providers: [ModuloReportesService, ResponseService],
})
export class ModuloReportesModule {}
