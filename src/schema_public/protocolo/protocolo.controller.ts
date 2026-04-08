import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProtocoloService } from './protocolo.service';
import { CreateProtocoloDto } from './dto/create-protocolo.dto';
import { UpdateProtocoloDto } from './dto/update-protocolo.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrearProtocoloModificacionDto } from './dto/create-protocolo-modificacion.dto';
import { FiltroFechasModificacionDto } from './dto/filtro_fechas_modificacion.dto';
import { FiltroDatosInformeDto } from './dto/filtro_datos_informe.dto';

@ApiTags('Protocolo')
@Controller('protocolo')
export class ProtocoloController {
  constructor(private readonly protocoloService: ProtocoloService) {}

  @Post()
  create(@Body() createProtocoloDto: CreateProtocoloDto) {
    return this.protocoloService.create(createProtocoloDto);
  }

  @Get()
  findAll() {
    return this.protocoloService.findAll();
  }

    
  @Get('fechas-modificacion')
  @ApiOperation({ summary: 'Obtiene las fechas y días_variación de una modificación para el protocolo'})
  obtenerFechasModificacion(
    @Query() filtro: FiltroFechasModificacionDto,) {
    return this.protocoloService.obtenerFechasModificacion(filtro);
  }

  @Get('datos-informe')
  @ApiOperation({summary: 'Obtiene los datos del informe (referencia, antecedentes, etc.) para el protocolo',})
  obtenerDatosInforme(
    @Query() filtro: FiltroDatosInformeDto,) {
    return this.protocoloService.obtenerDatosInforme(filtro);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.protocoloService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProtocoloDto: UpdateProtocoloDto) {
    return this.protocoloService.update(+id, updateProtocoloDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.protocoloService.remove(+id);
  }

  @Post('modificacion')
  crearProtocoloModificacion(
    @Body() dto: CrearProtocoloModificacionDto,
  ) {
    return this.protocoloService.crearProtocoloModificacion(dto);
  }

  @Get('historial/:id_modificacion_pago')
  obtenerHistorialProtocolo(@Param('id_modificacion_pago') id_modificacion_pago: number) {
    return this.protocoloService.obtenerHistorialProtocolo(id_modificacion_pago);
  }


}
