import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstadoGeneralService } from './estado_general.service';
import { CreateEstadoGeneralDto } from './dto/create-estado_general.dto';
import { UpdateEstadoGeneralDto } from './dto/update-estado_general.dto';

@Controller('estado-general')
export class EstadoGeneralController {
  constructor(private readonly estadoGeneralService: EstadoGeneralService) {}

  @Post()
  create(@Body() createEstadoGeneralDto: CreateEstadoGeneralDto) {
    return this.estadoGeneralService.create(createEstadoGeneralDto);
  }

  @Get()
  findAll() {
    return this.estadoGeneralService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadoGeneralService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstadoGeneralDto: UpdateEstadoGeneralDto) {
    return this.estadoGeneralService.update(+id, updateEstadoGeneralDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estadoGeneralService.remove(+id);
  }
}
