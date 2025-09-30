import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AvanceFisicoDocumentoService } from './avance_fisico_documento.service';
import { CreateAvanceFisicoDocumentoDto } from './dto/create-avance_fisico_documento.dto';
import { UpdateAvanceFisicoDocumentoDto } from './dto/update-avance_fisico_documento.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Avance Fisico Documento')
@Controller('avance-fisico-documento')
export class AvanceFisicoDocumentoController {
  constructor(private readonly avanceFisicoDocumentoService: AvanceFisicoDocumentoService) {}

  @Post()
  create(@Body() createAvanceFisicoDocumentoDto: CreateAvanceFisicoDocumentoDto) {
    return this.avanceFisicoDocumentoService.create(createAvanceFisicoDocumentoDto);
  }

  @Get()
  findAll() {
    return this.avanceFisicoDocumentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.avanceFisicoDocumentoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAvanceFisicoDocumentoDto: UpdateAvanceFisicoDocumentoDto) {
    return this.avanceFisicoDocumentoService.update(+id, updateAvanceFisicoDocumentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.avanceFisicoDocumentoService.remove(+id);
  }



}
