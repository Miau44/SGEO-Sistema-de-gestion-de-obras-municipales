import { Module } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { DocumentoController } from './documento.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './entities/documento.entity';
import { GarantiaSeguro } from '../garantia_seguro/entities/garantia_seguro.entity';
import { Informe } from '../informe/entities/informe.entity';


@Module({
  imports: [ 
    TypeOrmModule.forFeature([Documento, GarantiaSeguro, Informe])],  
  
  controllers: [DocumentoController],
  providers: [DocumentoService, ResponseService],
})
export class DocumentoModule {}
