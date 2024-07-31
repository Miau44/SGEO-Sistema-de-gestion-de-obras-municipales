import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ObraService } from './obra.service';
import { CreateObraDto } from './dto/create-obra.dto';
import { UpdateObraDto } from './dto/update-obra.dto';
import { UsuarioDto } from './dto/usuarioDto.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

import { EstructuraObraDto } from './dto/estructuraDto.dto';
import { EstadoGeneral } from '../estado_general/entities/estado_general.entity';
import { EstadoObraDto } from './dto/estado-obra.dto';
import { TipoObraModObraDto } from './dto/tipo-obra-modalidad.dto';

@ApiTags('obra')
@Controller('obra')
export class ObraController {
  constructor(private readonly obraService: ObraService) {}


  @Public()
  @Post()
  create(@Body() createObraDto: CreateObraDto) {
    try {
      return this.obraService.create(createObraDto)
    } catch (error) {
    }
  }

  @Public()
  @Get()
  findAll() {
    try {    
    return this.obraService.findAll();
  } catch (error) {
  } 
  }

  @Public()
  @Get(':id')

  findOne(@Param('id') id_obra: string) {
    try {  
    return this.obraService.findOne(+id_obra);
  } catch (error) {
  } 
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateObraDto: UpdateObraDto) {
    return this.obraService.update(+id, updateObraDto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.obraService.remove(+id);
  }


  @Public()
  @Post('listar')
  listarObraXUe(@Body() estructuraDto: EstructuraObraDto) {
    try {
      return this.obraService.listarObrasXUe(estructuraDto);
    } catch (error) {
    }
  }


  @Public()
  @Post('listar-obras')
  listarObrasXEstado(@Body() estadoDto: EstadoObraDto) {
    try {
      return this.obraService.listarObrasXEstado(estadoDto);
    } catch (error) {
    }
  }

  @Public()
  @Patch(':id_obra')
  actualizar(@Param('id_obra') id_obra: string, @Body() tipoObraModDto: TipoObraModObraDto) {
    return this.obraService.actualizar(+id_obra, tipoObraModDto);
  }  

}
