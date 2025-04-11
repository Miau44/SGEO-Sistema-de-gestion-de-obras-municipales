import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstadoSolicitudService } from './estado_solicitud.service';
import { CreateEstadoSolicitudDto } from './dto/create-estado_solicitud.dto';
import { UpdateEstadoSolicitudDto } from './dto/update-estado_solicitud.dto';

@Controller('estado-solicitud')
export class EstadoSolicitudController {
  constructor(private readonly estadoSolicitudService: EstadoSolicitudService) {}

  @Post()
  create(@Body() createEstadoSolicitudDto: CreateEstadoSolicitudDto) {
    return this.estadoSolicitudService.create(createEstadoSolicitudDto);
  }

  @Get()
  findAll() {
    return this.estadoSolicitudService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadoSolicitudService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstadoSolicitudDto: UpdateEstadoSolicitudDto) {
    return this.estadoSolicitudService.update(+id, updateEstadoSolicitudDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estadoSolicitudService.remove(+id);
  }
}
