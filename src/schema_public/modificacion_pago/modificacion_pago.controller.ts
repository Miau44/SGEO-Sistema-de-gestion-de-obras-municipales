import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModificacionPagoService } from './modificacion_pago.service';
import { CreateModificacionPagoDto } from './dto/create-modificacion_pago.dto';
import { UpdateModificacionPagoDto } from './dto/update-modificacion_pago.dto';
import { ApiTags } from '@nestjs/swagger';
import {  CreateMaestroDto } from './dto/create-maestro.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { listaModDto } from './dto/obra.dto';
import { ValidarModificacionDto } from './dto/dto-modificacion/validar-modificacion.dto';
 


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



  @Public()
  @Post('modificacion-validacion')
  async validar(@Body() validar: ValidarModificacionDto) {
    try {  
    return this.modificacionPagoService.validarModificacion(validar);

  } catch (error) {
  }    
  }  
}
