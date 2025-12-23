import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { LlamadaAtencionService } from './llamada_atencion.service';
import { CreateLlamadaAtencionDto } from './dto/create-llamada_atencion.dto';
import { UpdateLlamadaAtencionDto } from './dto/update-llamada_atencion.dto';
import { CrearLlamadaAtencionFormDto } from './dto/crear-llamada-atencionForm.dto';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('llamada-atencion')
@Controller('llamada-atencion')
export class LlamadaAtencionController {
  constructor(private readonly llamadaAtencionService: LlamadaAtencionService) {}

  @Post()
  create(@Body() createLlamadaAtencionDto: CreateLlamadaAtencionDto) {
    return this.llamadaAtencionService.create(createLlamadaAtencionDto);
  }

  @Get()
  findAll() {
    return this.llamadaAtencionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener datos de llamada de atención por ID' })
  @ApiParam({ name: 'id', type: Number })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.llamadaAtencionService.obtenerPorId(id);
  }

  @Patch('actualizar')
  @ApiOperation({ summary: 'Actualizar llamada de atención y (si aplica) el memorandum asociado' })
  actualizar(@Body() dto: UpdateLlamadaAtencionDto) {
    return this.llamadaAtencionService.actualizar(dto);
  }

  @Get('listar/:id_obra')
  listarPorObra(@Param('id_obra', ParseIntPipe) id_obra: number) {
    return this.llamadaAtencionService.listarPorObra(id_obra);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLlamadaAtencionDto: UpdateLlamadaAtencionDto) {
  //   return this.llamadaAtencionService.update(+id, updateLlamadaAtencionDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.llamadaAtencionService.remove(+id);
  }

  @Post('crear')
  crear(@Body() dto: CrearLlamadaAtencionFormDto) {
    return this.llamadaAtencionService.crear(dto);
  }
}
