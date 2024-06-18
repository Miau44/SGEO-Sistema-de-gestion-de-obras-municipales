import { Controller, Get, Post, Body, Patch, Param, Delete , UseGuards, UseFilters} from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { EstructuraDto } from './dto/estructuraDto.dto';
import { NotFoundException } from '@nestjs/common';
import { AllExceptionsFilter } from '../exception';


@ApiTags('persona')
@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

 // @UseGuards(JwtAuthGuard)
 // @UseGuards(AuthGuard('jwt'))

 //@UseFilters(AllExceptionsFilter) 
  @Post()
  create(@Body() createPersonaDto: CreatePersonaDto) {
    const resultado =  this.personaService.create(createPersonaDto);

    return {
      data: resultado,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      message: 'Request was successful',
    };    
  }

  @Get()
  findAll() {
    return this.personaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id_persona: string) {
    return this.personaService.findOne(+id_persona);
  }

  @Patch(':id')
  update(@Param('id') id_persona: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personaService.update(+id_persona, updatePersonaDto);
  }

  @Delete(':id')
  remove(@Param('id') id_persona: string) {
    return this.personaService.remove(+id_persona);
  }

  @Post('lista')
  listaGeneralPersonas(@Body() estructuraDto: EstructuraDto) {
    return this.personaService.listaGeneralPersonas(estructuraDto);
  }  
}
