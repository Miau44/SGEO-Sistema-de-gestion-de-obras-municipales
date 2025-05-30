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
import { LogService } from '../log/log.service';
import { Log } from '../log/entities/log.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Contrato,Ficha,Obra,Log]),ObraModule],
  providers: [ContratoService,
    {
      provide: ObraService, 
      useClass: ObraService, // Proveedor manual
    },
    {
      provide: ResponseService, 
      useClass: ResponseService, // Proveedor manual
    },{
      provide: LogService, 
      useClass: LogService, // Proveedor manual
    }],
  controllers: [ContratoController]
})
export class ContratoModule {}
