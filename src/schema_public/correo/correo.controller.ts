import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CorreoService } from './correo.service';
import { CreateCorreoDto } from './dto/create-correo.dto';
import { UpdateCorreoDto } from './dto/update-correo.dto';
import { EnviarCorreoDto } from './dto/enviar-correo.dto';

@Controller('correo')
export class CorreoController {
  constructor(private readonly correoService: CorreoService) {}

  @Get()
  findAll() {
    return this.correoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.correoService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.correoService.remove(+id);
  }

  @Post('enviar')
  async enviarCorreo(@Body() dto: EnviarCorreoDto) {
    return this.correoService.enviarCorreo(dto);
  }
}
