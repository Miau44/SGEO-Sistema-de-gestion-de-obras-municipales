import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DesignacionService } from './designacion.service';
import { CreateDesignacionDto } from './dto/create-designacion.dto';
import { UpdateDesignacionDto } from './dto/update-designacion.dto';
import { ApiOperation,ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';
import { EstadoObraDesigDto } from './dto/estado_obra_designacion.dto';

@ApiTags('designacion')

@Controller('designacion')
export class DesignacionController {
  constructor(private readonly designacionService: DesignacionService) {}

  @Public()
  @Post()
  create(@Body() createSolicitudDesignacionDto: CreateDesignacionDto ) {
    try {
      return this.designacionService.create(createSolicitudDesignacionDto);
    } catch (error) {
    }
  }
  @Public()
  @Get()
  findAll() {
    return this.designacionService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designacionService.findOne(+id);
  }

  /*@Public()
  @Patch('editar/:id')
  update(@Param('id') id: string, @Body() updateSolicitudDesignacionDto: UpdateDesignacionDto) {
    return this.designacionService.update(+id, updateSolicitudDesignacionDto);
  }*/


  @Public()
  @Patch(':id_designacion')
  update(@Param('id_designacion') id_designacion: string, @Body() updateDesignacionDto: UpdateDesignacionDto) {
    return this.designacionService.update(+id_designacion, updateDesignacionDto);
  }  
  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.designacionService.remove(+id);
  }


 /* @Public()
  @Patch(':id_designacion')
  actualizar(@Param('id_designacion') id_obra: string, @Body() estadoODDto: EstadoObraDesigDto) {
    return this.designacionService.actualizarAprobar(+id_obra, estadoODDto);
  }  */

  @Public()
  @Patch('aprobar/:id_designacion')
  actualizarAprobar(@Param('id_designacion') id_designacion: string, @Body() actEstadoDto: EstadoObraDesigDto) {
    return this.designacionService.actualizarAprobar(+id_designacion, actEstadoDto);
  }

 @Public()
  @Get('rechazar/:id_designacion')
  @ApiOperation({ summary: ' id_designacion:1' })
  rechazarDesignacion(@Param('id_designacion') id_designacion: number) {
    return this.designacionService.rechazar_designacion(+id_designacion);
  }
}
