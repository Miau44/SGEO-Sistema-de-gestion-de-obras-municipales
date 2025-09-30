import { Module } from '@nestjs/common';
import { AvanceFisicoDocumentoService } from './avance_fisico_documento.service';
import { AvanceFisicoDocumentoController } from './avance_fisico_documento.controller';

@Module({
  controllers: [AvanceFisicoDocumentoController],
  providers: [AvanceFisicoDocumentoService],
})
export class AvanceFisicoDocumentoModule {}
