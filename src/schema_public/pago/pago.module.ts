import { Module } from '@nestjs/common';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { Pago } from './entities/pago.entity';
import { Descuento } from './entities/descuento.entity';


@Module({

  imports: [TypeOrmModule.forFeature([Pago, Descuento])],

  controllers: [PagoController],
  providers: [PagoService, ResponseService],
})
export class PagoModule {}
