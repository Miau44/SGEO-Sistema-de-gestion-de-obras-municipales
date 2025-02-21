import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ModificacionPagoService } from './modificacion_pago.service';
import { CreateModificacionPagoDto } from './dto/create-modificacion_pago.dto';
import { UpdateModificacionPagoDto } from './dto/update-modificacion_pago.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {  CreateMaestroDto } from './dto/create-maestro.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { listaModDto } from './dto/obra.dto';
import { CreateModificacionDto } from './dto/create-modificacion.dto';
 


@ApiTags('modificacion-pago')
@Controller('modificacion-pago')
export class ModificacionPagoController {
  constructor(private readonly modificacionPagoService: ModificacionPagoService) {}

  @Post()
  create(@Body() createModificacionPagoDto: CreateModificacionPagoDto) {
    return this.modificacionPagoService.create(createModificacionPagoDto);
  }

  @Post('crear-modificacion-pago')
  createModificacionPago(@Body() createmaestro:CreateMaestroDto) {
    return this.modificacionPagoService.crearModificacionPago(createmaestro);
  }

  @Get()
  findAll() {
    return this.modificacionPagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
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




}
