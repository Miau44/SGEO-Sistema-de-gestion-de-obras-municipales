import { Module } from '@nestjs/common';
import { GarantiaSeguroService } from './garantia_seguro.service';
import { GarantiaSeguroController } from './garantia_seguro.controller';
import { Obra } from '../obra/entities/obra.entity';
import { Documento } from '../documento/entities/documento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDocumento } from '../tipo_documento/entities/tipo_documento.entity';
import { Estado } from '../estado/entities/estado.entity';
import { GarantiaSeguro } from './entities/garantia_seguro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GarantiaSeguro, Obra, Documento, TipoDocumento, Estado])],

  controllers: [GarantiaSeguroController],
  providers: [GarantiaSeguroService],
})
export class GarantiaSeguroModule {}
