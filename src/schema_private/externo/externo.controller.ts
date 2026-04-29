import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExternoService } from './externo.service';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';
import { LoginExternoDto } from './dto/login-externo.dtos';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ObraExternoDto } from './dto/obra.dto';
 

@ApiTags('externo')
@Controller('externo')
export class ExternoController {
  constructor(private readonly externoService: ExternoService) {}

  @Post()
  create(@Body() createExternoDto: CreateExternoDto) {
    return this.externoService.create(createExternoDto);
  }

  @Get()
  findAll() {
    return this.externoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.externoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExternoDto: UpdateExternoDto) {
    return this.externoService.update(+id, updateExternoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.externoService.remove(+id);
  }

  @Public()
  @Post('/logeo-sistema')
  async logeo(@Body() loginDto: LoginExternoDto) {
    return this.externoService.logeo(loginDto);
  }
 

  @Public()
  @Post('/items-sgpu')
  async itemsSGPU(@Body() datos: ObraExternoDto) {
    return this.externoService.sgpuItemsVigentes(datos);
  }

  @Public()
  @Post('/items-sgpu-all')
  async itemsSGPUAll() {
  return this.externoService.sgpuItemsVigentesexterno();
}

  @Get('consulta/:idContratoDlc/:nroModificacion')
async obtenerConsultaExterna(
  @Param('idContratoDlc') idContratoDlc: number,  
  @Param('nroModificacion') nroModificacion: number) {
  return this.externoService.obtenerConsultaExterna(Number(idContratoDlc), Number(nroModificacion));
}

}
