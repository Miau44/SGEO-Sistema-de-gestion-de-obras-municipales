import { Module } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { DocumentoController } from './documento.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './entities/documento.entity';


@Module({
  imports: [ 
    TypeOrmModule.forFeature([Documento])],  
  
  controllers: [DocumentoController],
  providers: [DocumentoService, ResponseService],
})
export class DocumentoModule {}
