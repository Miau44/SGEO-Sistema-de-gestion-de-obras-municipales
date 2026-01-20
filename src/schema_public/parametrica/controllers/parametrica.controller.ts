import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParametricaService } from './../services/parametrica.service';
import { CreateParametricaDto, UpdateParametricaDto } from './../dto/parametrica.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './../../auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { FiltrosDto } from './../dto/filtrosDto.dto';
import { BuscarSubtipoParametricaDto } from '../dto/buscar-subtipo.dto';

@ApiTags('parametrica')
@Controller('parametrica')
export class ParametricaController {
  constructor(private readonly parametricaService: ParametricaService) {}

  @Post()
  create(@Body() createParametricaDto: CreateParametricaDto) {
    return this.parametricaService.create(createParametricaDto);
  }

  @Get()
  findAll() {
    return this.parametricaService.findAll();
  }

  @Get(':id/lista')
  findAllByListaTabla(@Param('id') id: string) {
    return this.parametricaService.findAllByLista(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parametricaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParametricaDto: UpdateParametricaDto) {
    return this.parametricaService.update(+id, updateParametricaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parametricaService.remove(+id);
  }

  @Post('listar')
  listarXTipo(@Body() filtrosDto: FiltrosDto) {
    return this.parametricaService.listarXTipo(filtrosDto);
  }
  
@Post('buscar-subtipo')
@ApiOperation({ summary: 'Buscar subtipo de paramétrica por id_tipo e id_subtipo' })
buscarPorSubtipo(@Body() dto: BuscarSubtipoParametricaDto) {
  return this.parametricaService.buscarPorSubtipo(dto.id_tipo, dto.id_subtipo);
}
  
}
