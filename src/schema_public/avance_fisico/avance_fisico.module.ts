import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvanceFisico } from './entities/avance_fisico.entity';
import { AvanceFisicoService } from './avance_fisico.service';
import { AvanceFisicoController } from './avance_fisico.controller';
import { AvanceFisicoDocumento } from '../avance_fisico_documento/entities/avance_fisico_documento.entity';
import { Documento } from '../documento/entities/documento.entity';

@Module({
   imports: [
    // 👈 Esto registra AvanceFisicoRepository en el contexto del módulo
    TypeOrmModule.forFeature([AvanceFisico, AvanceFisicoDocumento, Documento]),
  ],
  controllers: [AvanceFisicoController],
  providers: [AvanceFisicoService],
  exports: [TypeOrmModule, AvanceFisicoService],
})
export class AvanceFisicoModule {}
