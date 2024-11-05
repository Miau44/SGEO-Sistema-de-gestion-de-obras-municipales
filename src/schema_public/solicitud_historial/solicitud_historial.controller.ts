import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitudHistorialService } from './solicitud_historial.service';
import { CreateSolicitudHistorialDto } from './dto/create-solicitud_historial.dto';
import { UpdateSolicitudHistorialDto } from './dto/update-solicitud_historial.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { SolicitudHistorial } from './entities/solicitud_historial.entity';


@ApiTags('solicitud-historial')
@Controller('solicitud-historial')
export class SolicitudHistorialController {
  constructor(private readonly solicitudHistorialService: SolicitudHistorialService) {}


  @Public()
  @Post()
  create(@Body() createSolicitudHistorialDto: CreateSolicitudHistorialDto) {
    try {
    return this.solicitudHistorialService.create(createSolicitudHistorialDto);
  } catch (error) {
  } 
  }

  @Get()
  findAll() {
    return this.solicitudHistorialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudHistorialService.findOne(+id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudHistorialDto: UpdateSolicitudHistorialDto) {
    return this.solicitudHistorialService.update(+id, updateSolicitudHistorialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudHistorialService.remove(+id);
  }
}
