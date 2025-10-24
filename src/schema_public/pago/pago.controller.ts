import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
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
import { PagoPagoDto } from './dto/pago-pago.dto';
import { ActualizarEstadoDescuentoDto } from './dto/dto-descuento/actualizar-descuento.dto';
import { ValidarPagoDto } from './dto/pago-validar.dto';
import { AprobarPagoDto } from './dto/pago-aprobar.dto';
import { PagoModificacionPagoDto } from './dto/pago-mod-pago.dto';
import { UsuarioPagoDto } from './dto/pago-usuario.dto';



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
    try {
      return this.pagoService.findOne(+id);
    } catch (error) {
      throw new HttpException('Error al obtener la modificación', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return this.pagoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id_pago: string, @Body() updatePagoDto: UpdatePagoDto) {
    try {
    return this.pagoService.update(+id_pago, updatePagoDto);
  }   catch (error) {
  }}

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

    @Post('validar-pago')
    async validarPago(@Body() data: ValidarPagoDto): Promise<{ valido: boolean; mensaje: string }> {
    return this.pagoService.validarPago(data);
    }

  /*  @Post('validar-planilla-pago')
    async validarPlanillaPago(@Body() data: ValidarPagoDto): Promise<{ valido: boolean; mensaje: string }> {
    return this.pagoService.validarPlanillaPago(data);
    }
*/


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
  @Post('actualizar-descuento-estado')
  listaActualizarPago(@Body() data: ActualizarEstadoDescuentoDto) {
    try {
      return this.pagoService.actualizarEstadoDescuento(data);
    } catch (error) {
    }
  } 


      @Public()
  @Post('pago-actualizar-datos')
  listaActualizarDatos(@Body() data: PagoPagoDto) {
    try {
      return this.pagoService.actualizarPagoTotales(data);
    } catch (error) {
    }
  } 


    @Public()
    @Post('pago-pre-aprobacion')
    async preAprobacionPago(@Body() validar: AprobarPagoDto) {
      try {
        return this.pagoService.preAprobarPago(validar);
  
      } catch (error) {
      }
    }
  
   
  

    @Public()
    @Post('pago-aprobacion')
    async aprobacionPago(@Body() validar: PagoModificacionPagoDto) {
      try {
        return this.pagoService.AprobarPago(validar);
  
      } catch (error) {
      }
    }


    @Public()
    @Post('pago-usuario-aprobacion')
    async usuarioPago(@Body() validar: UsuarioPagoDto) {
      try {
        return this.pagoService.maePago(validar);
  
      } catch (error) {
      }
    }

 @Public()
    @Post('pago-des-aprobacion')
    async desAprobacionPago(@Body() validar: AprobarPagoDto) {
      try {
        return this.pagoService.desAprobarPago(validar);
  
      } catch (error) {
      }
    }
      
     @Public()
    @Post('pago-postfechado')
    async postfechadoPago(@Body() validar: PagoObraDto) {
      try {
        return this.pagoService.postfechadoPago(validar);
  
      } catch (error) {
      }
    }
      
    
}
