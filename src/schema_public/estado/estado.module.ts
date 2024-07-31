import { Module } from '@nestjs/common';
import { EstadoService } from './estado.service';
import { EstadoController } from './estado.controller';

@Module({
  controllers: [EstadoController],
  providers: [EstadoService],
})
export class EstadoModule {}
