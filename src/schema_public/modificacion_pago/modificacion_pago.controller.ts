import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, HttpException } from '@nestjs/common';
import { ModificacionPagoService } from './modificacion_pago.service';
import { CreateModificacionPagoDto } from './dto/create-modificacion_pago.dto';
import { UpdateModificacionPagoDto } from './dto/update-modificacion_pago.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMaestroDto } from './dto/create-maestro.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { listaModDto } from './dto/obra.dto';
import { CreateModificacionDto } from './dto/create-modificacion.dto';
import { ValidarModificacionDto } from './dto/dto-modificacion/validar-modificacion.dto';



@ApiTags('modificacion-pago')
@Controller('modificacion-pago')
export class ModificacionPagoController {
  constructor(private readonly modificacionPagoService: ModificacionPagoService) { }

  @Post()
  create(@Body() createModificacionPagoDto: CreateModificacionPagoDto) {
    return this.modificacionPagoService.create(createModificacionPagoDto);
  }

  @Post('crear-modificacion-pago')
  createModificacionPago(@Body() createmaestro: CreateMaestroDto) {
    return this.modificacionPagoService.crearModificacionPago(createmaestro);
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
  async tieneIncremento(@Body() validar: ValidarModificacionDto) {
    try {
      return this.modificacionPagoService.tieneIncremento(validar.id_modificacion_pago);

    } catch (error) {
    }
  }

  //Listado de modificaciones por carpeta, servicio de lectura DLC
  @Public()
  @Get('ModificacionesPorContrato/:id_contrato')
  @HttpCode(HttpStatus.OK)
  async ModificacionesPorContrato(@Param('id_contrato') id_contrato: number) {
    try {
      return this.modificacionPagoService.listadoModificacionesxContrato(id_contrato);
    } catch (error) {

    }
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
        fecha_memo_minuta: { type: 'string', example: '2023-08-01' }
      }
    }
  })
  async guardadoNumeracion(@Body() body: { id_modificacion: number, numero_contrato_modificatorio: string, fecha_memo_minuta: string }) {
    try {
      return this.modificacionPagoService.guardadoNumeracion(body.id_modificacion, body.numero_contrato_modificatorio, body.fecha_memo_minuta);
    } catch (error) {
      throw new HttpException('Error al guardar la numeración', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
