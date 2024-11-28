import { Module } from '@nestjs/common';
import { GarantiaSeguroService } from './garantia_seguro.service';
import { GarantiaSeguroController } from './garantia_seguro.controller';
import { Obra } from '../obra/entities/obra.entity';
import { Documento } from '../documento/entities/documento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDocumento } from '../tipo_documento/entities/tipo_documento.entity';
import { GarantiaSeguro } from './entities/garantia_seguro.entity';
import { ResponseService } from 'src/response.service';

@Module({
  imports: [TypeOrmModule.forFeature([GarantiaSeguro, Obra, Documento, TipoDocumento])],

  controllers: [GarantiaSeguroController],
  providers: [GarantiaSeguroService, ResponseService],
})
export class GarantiaSeguroModule {}
