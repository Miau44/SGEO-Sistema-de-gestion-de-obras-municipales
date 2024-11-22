import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Solicitud } from './entities/solicitud.entity';
import { BandejaDto } from './dto/bandeja.dtos';
import { GenerarSolicitudDto } from './dto/generar-solicitud.dto';
import { EtapaSolicitudDto } from './dto/etapa-solicitud.dto';
import { UsuarioSolicitudDto } from './dto/usuario-solicitud.dto';

@ApiTags('solicitud')
@Controller('solicitud')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}


  @Public()
  @Post()
  create(@Body() createSolicitudDto: CreateSolicitudDto) {
    try {
    return this.solicitudService.create(createSolicitudDto);
  } catch (error) {
  }    
  }

  @Get()
  findAll() {
    return this.solicitudService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id_solicitud: string) {
    try {
    return this.solicitudService.findOne(+id_solicitud);
  } catch (error) {
  }    
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudDto: UpdateSolicitudDto) {
    return this.solicitudService.update(+id, updateSolicitudDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudService.remove(+id);
  }


  @Public()
  @Post('listar-mi-bandeja')
  misProyectos(@Body() mibandejaDto: BandejaDto) {
    try {
      return this.solicitudService.listarMiBandeja(mibandejaDto);
    } catch (error) {
    }
  }    


  @Public()
  @Post('generar-solicitud')
  generarSolicitud(@Body() dataDto: GenerarSolicitudDto) {
    try {
      return this.solicitudService.generarSolicitud(dataDto);
    } catch (error) {
    }
  }  


  @Public()
  @Post('ver-etapa-solicitud')
  verEtapaSolicitud(@Body() etapaDto: EtapaSolicitudDto) {
    try {
      return this.solicitudService.verEtapaSolicitud(etapaDto);
    } catch (error) {
    }
  }  

  @Public()
  @Post('usuario-solicitud')
  usuarioSolicitud(@Body() usuarioDto: UsuarioSolicitudDto) {
    try {
      return this.solicitudService.usuarioSolicitud(usuarioDto);
    } catch (error) {
    }
  }    

}
