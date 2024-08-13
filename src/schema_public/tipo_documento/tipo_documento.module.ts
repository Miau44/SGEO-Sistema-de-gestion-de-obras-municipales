import { Module } from '@nestjs/common';
import { TipoDocumentoService } from './tipo_documento.service';
import { TipoDocumentoController } from './tipo_documento.controller';
import { TipoDocumento } from './entities/tipo_documento.entity';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ 
  TypeOrmModule.forFeature([TipoDocumento])],  
  controllers: [TipoDocumentoController],
  providers: [TipoDocumentoService, ResponseService],
})
export class TipoDocumentoModule {}


TipoDocumento