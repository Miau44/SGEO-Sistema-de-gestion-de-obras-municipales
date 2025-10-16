import { Module } from '@nestjs/common';
import { ProtocoloModificacionService } from './protocolo_modificacion.service';
import { ProtocoloModificacionController } from './protocolo_modificacion.controller';

@Module({
  controllers: [ProtocoloModificacionController],
  providers: [ProtocoloModificacionService],
})
export class ProtocoloModificacionModule {}
