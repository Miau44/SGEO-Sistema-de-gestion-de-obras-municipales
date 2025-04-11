import { Module } from '@nestjs/common';
import { TipoDocumentoService } from './tipo_documento.service';
import { TipoDocumentoController } from './tipo_documento.controller';
import { TipoDocumento } from './entities/tipo_documento.entity';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GarantiaSeguro } from '../garantia_seguro/entities/garantia_seguro.entity';
import { Memorandum } from '../memorandum/entities/memorandum.entity';

@Module({
  imports: [ 
  TypeOrmModule.forFeature([TipoDocumento, GarantiaSeguro, Memorandum])],  
  controllers: [TipoDocumentoController],
  providers: [TipoDocumentoService, ResponseService],
})
export class TipoDocumentoModule {}


TipoDocumento