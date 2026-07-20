import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CorreoService } from './correo.service';
import { CreateCorreoDto } from './dto/create-correo.dto';
import { UpdateCorreoDto } from './dto/update-correo.dto';
import { EnviarCorreoProcesoDto } from './dto/enviar-correo-proceso.dto';
import { EnviarAlertaCronogramaDto } from './dto/enviar-alerta-cronograma.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Correo')
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
  async enviarCorreo(@Body() dto: EnviarCorreoProcesoDto) {
    return this.correoService.enviarCorreoProceso(dto);
  }

  @Post('enviar-alerta-cronograma')
  async enviarAlertaCronograma(@Body() dto: EnviarAlertaCronogramaDto) {
    return this.correoService.enviarAlertaCronograma(dto);
  }
}
