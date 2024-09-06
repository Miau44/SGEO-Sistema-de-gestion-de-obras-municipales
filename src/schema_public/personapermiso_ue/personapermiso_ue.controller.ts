import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PersonapermisoUeService } from './personapermiso_ue.service';
import { CreatePersonapermisoUeDto } from './dto/create-personapermiso_ue.dto';
import { UpdatePersonapermisoUeDto } from './dto/update-personapermiso_ue.dto';
import { ApiTags } from '@nestjs/swagger';

import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';
import { PermisoXUeDto } from './dto/datos.dto';
import { TodaslasUesDto } from './dto/todaslasUes.dto';

@ApiTags('personapermiso-ue')
@Controller('personapermiso-ue')
export class PersonapermisoUeController {
  constructor(private readonly personapermisoUeService: PersonapermisoUeService) {}


  @Public()  
  @Post()
  create(@Body() createPersonapermisoUeDto: CreatePersonapermisoUeDto) {
    try {    
    return this.personapermisoUeService.create(createPersonapermisoUeDto);
  } catch (error) {
  }     
  }

  @Get()
  findAll() {
    return this.personapermisoUeService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personapermisoUeService.findOne(+id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonapermisoUeDto: UpdatePersonapermisoUeDto) {
    try {    
    return this.personapermisoUeService.update(+id, updatePersonapermisoUeDto);
  } catch (error) {
  }     
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personapermisoUeService.remove(+id);
  }

  @Public()
  @Post('listar-permisos-ue')
  listarPermisosXUe(@Body() datosDto: PermisoXUeDto) {
    try {
      return this.personapermisoUeService.listarPermisosXUe(datosDto);
    } catch (error) {
    }
  }  


  @Public()
  @Post('asignar-todas-ues')
  asignarTodaslasUes(@Body() datosDto: TodaslasUesDto) {
    try {
      return this.personapermisoUeService.insertarTodaslasUe(datosDto);
    } catch (error) {
    }
  } 
}
