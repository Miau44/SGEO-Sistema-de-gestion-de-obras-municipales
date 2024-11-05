import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitudEstadoService } from './solicitud_estado.service';
import { CreateSolicitudEstadoDto } from './dto/create-solicitud_estado.dto';
import { UpdateSolicitudEstadoDto } from './dto/update-solicitud_estado.dto';

@Controller('solicitud-estado')
export class SolicitudEstadoController {
  constructor(private readonly solicitudEstadoService: SolicitudEstadoService) {}

  @Post()
  create(@Body() createSolicitudEstadoDto: CreateSolicitudEstadoDto) {
    return this.solicitudEstadoService.create(createSolicitudEstadoDto);
  }

  @Get()
  findAll() {
    return this.solicitudEstadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudEstadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudEstadoDto: UpdateSolicitudEstadoDto) {
    return this.solicitudEstadoService.update(+id, updateSolicitudEstadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudEstadoService.remove(+id);
  }
}
