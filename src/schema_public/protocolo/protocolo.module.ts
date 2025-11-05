import { Module } from '@nestjs/common';
import { ProtocoloService } from './protocolo.service';
import { ProtocoloController } from './protocolo.controller';

@Module({
  controllers: [ProtocoloController],
  providers: [ProtocoloService],
})
export class ProtocoloModule {}
