import { Module } from '@nestjs/common';
import { DocumentoSistema } from './entities/documento_sistema.entity';
import { DocumentoSistemaService } from './documento_sistema.service';
import { DocumentoSistemaController } from './documento_sistema.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoSistema])],
  controllers: [DocumentoSistemaController],
  providers: [DocumentoSistemaService],
  exports: [DocumentoSistemaService]
})
export class DocumentoSistemaModule {}
