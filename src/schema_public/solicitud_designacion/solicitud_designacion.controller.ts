import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitudDesignacionService } from './solicitud_designacion.service';
import { CreateSolicitudDesignacionDto } from './dto/create-solicitud_designacion.dto';
import { UpdateSolicitudDesignacionDto } from './dto/update-solicitud_designacion.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';

@ApiTags('sol-designacion')
@Controller('solicitud-designacion')
export class SolicitudDesignacionController {
  constructor(private readonly solicitudDesignacionService: SolicitudDesignacionService) { }

  @Public()
  @Post()
  create(@Body() createSolicitudDesignacionDto: CreateSolicitudDesignacionDto) {
    try {
      return this.solicitudDesignacionService.create(createSolicitudDesignacionDto);
    } catch (error) {
    }
  }

  @Get()
  findAll() {
    return this.solicitudDesignacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudDesignacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudDesignacionDto: UpdateSolicitudDesignacionDto) {
    return this.solicitudDesignacionService.update(+id, updateSolicitudDesignacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudDesignacionService.remove(+id);
  }
}
