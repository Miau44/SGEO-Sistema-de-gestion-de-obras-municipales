import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from './entities/contrato.entity';
import { ContratoController } from './contrato.controller';
import { ContratoService } from './contrato.service';
import { Ficha } from '../ficha/entities/ficha.entity';
import { Obra } from '../obra/entities/obra.entity';
import { ObraModule } from '../obra/obra.module';
import { ObraService } from '../obra/obra.service';
import { ResponseService } from 'src/response.service';
@Module({
  imports: [TypeOrmModule.forFeature([Contrato,Ficha,Obra]),ObraModule],
  providers: [ContratoService,
    {
      provide: ObraService, 
      useClass: ObraService, // Proveedor manual
    },
    {
      provide: ResponseService, 
      useClass: ResponseService, // Proveedor manual
    }],
  controllers: [ContratoController]
})
export class ContratoModule {}
