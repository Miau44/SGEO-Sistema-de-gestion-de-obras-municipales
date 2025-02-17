import { Controller, Get, Post, Body, Patch, Param, Delete , UseGuards, UseFilters, BadRequestException} from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { EstructuraDto } from './dto/estructuraDto.dto';
import { NotFoundException } from '@nestjs/common';
import { AllExceptionsFilter } from '../exception';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';
import { EstructuraGralDto } from './dto/estructuraGral.dto';
import { EstructuraDaDto } from './dto/estructuraDa.dto';
import { RolDto } from './dto/rolDTO.dto';
import { Any } from 'typeorm';
import { PersonasEstadoDto } from './dto/personas-estado.dto';
import { ListaEstructuraDto } from './dto/listaEstructura.dto';
import { PersonaSolcitudDto } from './dto/persona-solicitud.dto';

@ApiTags('persona')
@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService, private responseService: ResponseService) { }

 // @UseGuards(JwtAuthGuard)
 // @UseGuards(AuthGuard('jwt'))
 @UseFilters(AllExceptionsFilter) 
  @Post()
  create(@Body() createPersonaDto: CreatePersonaDto) {
        try {
          return this.personaService.create(createPersonaDto)          
        } catch (error) {
        }
  }

  @Get()
  findAll() {
    try {
      return this.personaService.findAll();
    } catch (error) {
    }    
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
    try {
      return this.personaService.remove(+id_persona);
    } catch (error) {
    }
}
 /* @Public()
  @Post('listapersonas')
  listaPersonas(@Body() rolDto: RolDto) {
    try {
      let idsArray: number[];      
      idsArray = rolDto.id_rol.map(id => {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
          throw new BadRequestException('All ids must be valid numbers');
        }
        return parsedId;
      });  
      return this.personaService.listaPersonas(rolDto);
    } catch (error) {
    }
  } */ 



    @Post('listapersonas')
    listaPersonas(@Body() rolDto: RolDto) {
      try {  
        return this.personaService.listaPersonas(rolDto);
      } catch (error) {
      }
    }
  

  @Post('lista')
  listaPersonasXRol(@Body() estructuraDto: EstructuraDto) {
    try {
      return this.personaService.listaPersonasXRol(estructuraDto);
    } catch (error) {
    }
  }

 
  @Post('lista-general')
  listaGeneralPersonas(@Body() EstructuraGralDto: EstructuraGralDto) {
    try {
      return this.personaService.listaGeneralPersonas(EstructuraGralDto);
    } catch (error) { }
  }

  
  @Post('estructura-da')
  async estructuraDa(@Body() estructuraDa: EstructuraDaDto) {
    try {
      return this.personaService.estructuraDa(estructuraDa);
    } catch (error) {
    }
  }

  
  @Get('persmisos/:id_persona')
  persimosXPersona(@Param('id_persona') id_persona: number) {
    try {
    return this.personaService.persimosXPersona(id_persona);
  } catch (error) {  
  }
}




@Post('listapersonas-designadas')
listaPersonasDesignadas(@Body() estadoDto: PersonasEstadoDto) {
  try {  
    return this.personaService.listaPersonasDesignadas(estadoDto);
  } catch (error) {
  }
}

@Post('listapersonas-solicitud')
listaPersonasXSolicitud(@Body() estadoDto: PersonaSolcitudDto) {
  try {  
    return this.personaService.listaPersonasXSolicitudyEstado(estadoDto);
  } catch (error) {
  }
}



@Post('estructura-x-permiso')
estructuraXPermisos(@Body() permisoDto: ListaEstructuraDto) {
  try {  
    return this.personaService.estructuraXPermisos(permisoDto);
  } catch (error) {
  }
}

@Public()
@Post('estructura-xda-permiso')
estructuraXDAPermisos(@Body() permisoDto: ListaEstructuraDto) {
  try {  
    return this.personaService.estructuraXDAPermisos(permisoDto);
  } catch (error) {
  }
}

@Public()
@Post('listapersonas-nodesignadas')
listaPersonasNoDesignadas(@Body() estadoDto: PersonasEstadoDto) {
  try {  
    return this.personaService.listaPersonasNoDesignadas(estadoDto);
  } catch (error) {
  }
}

 /* @Public()
  @Post('listapersonas-nodesignadas')
  listaPersonasNoDesignadas(@Body() rolDto: RolDto) {
    try {
      let idsArray: number[];      
      idsArray = rolDto.id_rol.map(id => {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
          throw new BadRequestException('All ids must be valid numbers');
        }
        return parsedId;
      });  
      return this.personaService.listaPersonasNoDesignadas(rolDto);
    } catch (error) {
    }  

}  */


}
