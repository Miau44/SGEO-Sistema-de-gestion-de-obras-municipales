import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComunicadoService } from './comunicado.service';
import { CreateComunicadoDto } from './dto/create-comunicado.dto';
import { UpdateComunicadoDto } from './dto/update-comunicado.dto';

@Controller('comunicado')
export class ComunicadoController {
  constructor(private readonly comunicadoService: ComunicadoService) {}

  @Post()
  create(@Body() createComunicadoDto: CreateComunicadoDto) {
    return this.comunicadoService.create(createComunicadoDto);
  }

  @Get()
  findAll() {
    return this.comunicadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comunicadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComunicadoDto: any) {
    return this.comunicadoService.update(+id, updateComunicadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comunicadoService.remove(+id);
  }
}
