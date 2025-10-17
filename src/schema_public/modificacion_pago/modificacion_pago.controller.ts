import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, HttpException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ModificacionPagoService } from './modificacion_pago.service';
import { CreateModificacionPagoDto } from './dto/create-modificacion_pago.dto';
import { UpdateModificacionPagoDto } from './dto/update-modificacion_pago.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMaestroDto } from './dto/create-maestro.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { listaModDto } from './dto/obra.dto';
import { CreateModificacionDto } from './dto/create-modificacion.dto';
import { ValidarModificacionDto } from './dto/dto-modificacion/validar-modificacion.dto';
import { ActualizarModPagoDto } from './dto/modificacion-pago.dto';
import { AuthGuard } from '@nestjs/passport';



@ApiTags('modificacion-pago')
@Controller('modificacion-pago')
export class ModificacionPagoController {
  constructor(private readonly modificacionPagoService: ModificacionPagoService) { }

  @Post()
  create(@Body() createModificacionPagoDto: CreateModificacionPagoDto) {
    return this.modificacionPagoService.create(createModificacionPagoDto);
  }
  @Public()
  @Post('crear-modificacion-pago')
  createModificacionPago(@Body() createmaestro: CreateMaestroDto) {
        try {
    return this.modificacionPagoService.crearModificacionPago(createmaestro);
      } catch (error) { } 
  }

  @Get()
  findAll() {
    return this.modificacionPagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      return this.modificacionPagoService.findOne(+id);
    } catch (error) {
      throw new HttpException('Error al obtener la modificación', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return this.modificacionPagoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModificacionPagoDto: UpdateModificacionPagoDto) {
    return this.modificacionPagoService.update(+id, updateModificacionPagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modificacionPagoService.remove(+id);
  }

  @Public()
  @Post('modificacion-lista')
  listaModificacion(@Body() documentoDto: listaModDto) {
    try {
      return this.modificacionPagoService.listaModificacion(documentoDto);
    } catch (error) {
    }
  }

  //controllers para modificacion Marvel


  //modificacion de dias variacion (especifico)
  @Patch('modificacion/:id_modificacion/dias-variacion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar días de variación por ID de modificación' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dias_variacion: { type: 'number', example: 12 }
      }
    }
  })
  async updateDiasVariacion(
    @Param('id_modificacion', ParseIntPipe) id_modificacion: number,
    @Body('dias_variacion', ParseIntPipe) dias_variacion: number
  ) {
    return await this.modificacionPagoService.updateDiasVariacion(id_modificacion, dias_variacion);
  }

  // 🔹 Obtener datos de una modificación por ID
  @Get(':id')
  async obtenerModificacion(@Param('id') id: number) {
    return await this.modificacionPagoService.obtenerModificacion(id);
  }

  // 🔹 Guardar o actualizar modificación
  @Post()
  async guardarModificacion(@Body() datos: CreateModificacionDto) {
    return await this.modificacionPagoService.guardarModificacion(datos);
  }






  @Public()
  @Post('modificacion-validacion')
  async validar(@Body() validar: ValidarModificacionDto) {
    try {
      return this.modificacionPagoService.validarModificacion(validar);

    } catch (error) {
    }
  }


  @Public()
  @Post('modificacion-aprobacion')
  async aprobacion(@Body() validar: ValidarModificacionDto) {
    try {
      return this.modificacionPagoService.aprobarModificacion(validar);

    } catch (error) {
    }
  }

  @Public()
  @Post('tiene-incremento')
  async tieneIncremento(@Body() validar: ActualizarModPagoDto) {
    try {
      return this.modificacionPagoService.tieneIncremento(validar);

    } catch (error) {
    }
  }

  
  //Listado de modificaciones por contrato, servicio de lectura DLC
  @UseGuards(AuthGuard('jwt'))
  @Get('ModificacionesPorContrato/:id_contrato/:id_tipo')
  @HttpCode(HttpStatus.OK)
  async ModificacionesPorContrato(@Param('id_contrato') id_contrato: number, @Param('id_tipo') id_tipo: number) {
    try {
      return this.modificacionPagoService.listadoModificacionesxContrato(id_contrato, id_tipo);
    } catch (error) {}
  }

  //Listado de modificaciones por carpeta, servicio de lectura SIM
  @UseGuards(AuthGuard('jwt'))
  @Public()
  @Get('ModificacionesPorCarpeta/:id_carpeta')
  @HttpCode(HttpStatus.OK)
  async ModificacionesPorCarpeta(@Param('id_carpeta') id_carpeta: number) {
    try {
      return this.modificacionPagoService.listadoModificacionesxCarpeta(id_carpeta);
    } catch (error) {}
  }

  //Listado de pagos por carpeta, Servicio de lectura SIM
  //@UseGuards(AuthGuard('jwt'))
  @Public()
  @Get('PagosPorCarpeta/:id_carpeta')
  @HttpCode(HttpStatus.OK)
  async PagosPorCarpeta(@Param('id_carpeta') id_carpeta: number) {
    try {
      return this.modificacionPagoService.listadoPagosxCarpeta(id_carpeta);
    } catch (error) {}
  }

  //servicio en metodo post, guardado de numeración del contrato
  @Post('guardado-numeracion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Guardar numeración de modificación' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id_modificacion: { type: 'number', example: 200 },
        numero_contrato_modificatorio: { type: 'string', example: 'CONTRATO-001' },
        fecha_memo_minuta: { type: 'string', example: '2025-08-01' },
        fecha_registro_contrato: { type: 'string', example: '2025-08-02' } 
      }
    }
  })
  async guardadoNumeracion(@Body() body: { id_modificacion: number, numero_contrato_modificatorio: string, fecha_memo_minuta: string, fecha_registro_contrato: string }) {
    try {
      return this.modificacionPagoService.guardadoNumeracion(body.id_modificacion, body.numero_contrato_modificatorio, body.fecha_memo_minuta, body.fecha_registro_contrato);
    } catch (error) {
      throw new HttpException('Error al guardar la numeración', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  @Public()
  @Post('actualizar-autorizado')
  listaActualizarPago(@Body() data: ActualizarModPagoDto) {
    try {
      return this.modificacionPagoService.actualizarAutorizado(data);
    } catch (error) {
    }
  } 


}
