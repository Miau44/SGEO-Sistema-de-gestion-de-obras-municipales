import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PersonaPermisoService } from './persona_permiso.service';
import { CreatePersonaPermisoDto } from './dto/create-persona_permiso.dto';
import { UpdatePersonaPermisoDto } from './dto/update-persona_permiso.dto';
import { ApiTags } from '@nestjs/swagger';

import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';
import { UsuarioDto } from './dto/usuario.dto';


@ApiTags('persona-permiso')
@Controller('persona-permiso')
export class PersonaPermisoController {
  constructor(private readonly personaPermisoService: PersonaPermisoService) {}

  @Public()
  @Post()
  create(@Body() createPersonaPermisoDto: CreatePersonaPermisoDto) {
    try {    
    return this.personaPermisoService.create(createPersonaPermisoDto);
  } catch (error) {
  }    
  }

  @Public()
  @Get()
  findAll() {
    return this.personaPermisoService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personaPermisoService.findOne(+id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonaPermisoDto: UpdatePersonaPermisoDto) {
    try {      
    return this.personaPermisoService.update(+id, updatePersonaPermisoDto);
  } catch (error) {
  }     
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personaPermisoService.remove(+id);
  }

  @Public()
  @Post('usuario-permiso')
  listarUsuarioPermiso(@Body() datosDto: UsuarioDto) {
    try {
      return this.personaPermisoService.listarUsuarioPermiso(datosDto);
    } catch (error) {
    }
  }  
}
