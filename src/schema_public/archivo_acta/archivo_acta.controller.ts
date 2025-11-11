import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ArchivoActaService } from './archivo_acta.service';
import { CreateArchivoActaDto } from './dto/create-archivo_acta.dto';
import { UpdateArchivoActaDto } from './dto/update-archivo_acta.dto';

@Controller('archivo-acta')
export class ArchivoActaController {
  constructor(private readonly archivoActaService: ArchivoActaService) {}

  @Post()
  create(@Body() createArchivoActaDto: CreateArchivoActaDto) {
    return this.archivoActaService.create(createArchivoActaDto);
  }

  @Get()
  findAll() {
    return this.archivoActaService.findAll();
  }

  @Patch(':id')
  update_ingreso(@Param('id') id: string, @Body() dto: UpdateArchivoActaDto) {
    return this.archivoActaService.update_ingreso(+id, dto);
  }

  @Get('/jenny')
  jenny() {
   return this.archivoActaService.jenny();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.archivoActaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArchivoActaDto: UpdateArchivoActaDto) {
    return this.archivoActaService.update(+id, updateArchivoActaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.archivoActaService.remove(+id);
  }
  


}
