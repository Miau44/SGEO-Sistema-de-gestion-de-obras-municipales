import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { PagoObraDto } from './dto/pago.obra.dto';

import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PagoPlanillaDto } from './dto/pago_planilla.dto';
import { CreateDescuentoDto } from './dto/dto-descuento/create-descuento.dto';
import { Descuento } from './entities/descuento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { Pago } from './entities/pago.entity';
import { error } from 'console';
import { PagoDescuentoDto } from './dto/dto-descuento/pago-descuento.dto';



@ApiTags('Pagos')
@Controller('pago')
export class PagoController {
  constructor(private readonly pagoService: PagoService


  ) {}

  @Post()
  create(@Body() createPagoDto: CreatePagoDto) {
    return this.pagoService.create(createPagoDto);
  }

  @Get()
  findAll() {
    return this.pagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagoService.findOne(+id);
  }

 /* @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagoDto: UpdatePagoDto) {
    return this.pagoService.update(+id, updatePagoDto);
  }*/

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagoService.remove(+id);
  }

  @Public()
  @Post('lista-tipo-pago')
  listaModificacion(@Body() data: PagoObraDto) {
    try {
      return this.pagoService.listaTipoPago(data);
    } catch (error) {
    }
  }

  @Public()
  @Post('pago-lista')
  listaPago(@Body() data: PagoObraDto) {
    try {
      return this.pagoService.listaPago(data);
    } catch (error) {
    }
  }  


    @Public()
    @Post('pago-planilla-lista')
    listaItem(@Body() data: PagoPlanillaDto) {
      try {  
        return this.pagoService.listaPlanillaPago(data);
      } catch (error) {
      }
    }

//----------------------------->>>>>>>>>>>DESCUENTO<<<<<<<<<<<<--------------------------------
  @Public()

@Post('create-descuento')
  createDescuento(@Body() createDto: CreateDescuentoDto) {
    try{
    return this.pagoService.createDescuento(createDto);
  }catch {error}
  }  

    @Public()
    @Post('lista-descuento-pago')
    listaDescuento(@Body() data: PagoDescuentoDto) {
      try {  
        return this.pagoService.listaDescuentoPago(data);
      } catch (error) {
      }
    }  
 
 

  @Public()
  @Post('pago-resumen-lista')
  listaResumen(@Body() data: PagoPlanillaDto) {
    try {
      return this.pagoService.listaResumenPago(data);
    } catch (error) {
    }
  } 

    @Public()
  @Post('pago-actualizar-lista')
  listaActualizarPago(@Body() data: PagoPlanillaDto) {
    try {
      return this.pagoService.actualizarPago(data);
    } catch (error) {
    }
  } 
}
