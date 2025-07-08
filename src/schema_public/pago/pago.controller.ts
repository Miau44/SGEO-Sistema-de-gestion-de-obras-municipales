import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { PagoObraDto } from './dto/pago.obra.dto';

import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PagoPlanillaDto } from './dto/pago_planilla.dto';



@ApiTags('Pagos')
@Controller('pago')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagoDto: UpdatePagoDto) {
    return this.pagoService.update(+id, updatePagoDto);
  }

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

}
