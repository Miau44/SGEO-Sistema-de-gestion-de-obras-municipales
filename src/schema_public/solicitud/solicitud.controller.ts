import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
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
import { UsuarioSolicitudObraDto } from './dto/usuario-asignado-obra.dto';
import { CreateSolicitudHistorialDto } from './dto/create-solicitud-historial.dto';
import { UpdateSolicitudHistorialDto } from './dto/update-solicitud-historial.dto';
import { HistorialObraDto } from './dto/historial-obra.dto';
import { HistorialSolicitudDto } from './dto/historial-solicitud.dto';
import { ContadorGestionDto } from './dto/contador-gestion.dto';
import { UsuarioSolicitudXObraDto } from './dto/usuario-solicitud-obra.dto';

@ApiTags('solicitud')
@Controller('solicitud')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService,
  ) { }


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
  
 

 /* @Public()
  @Get('contador-solicitudes/:usuario')
  async getTaskCounts(@Param('usuario', ParseIntPipe) usuario: number) {
    try {
      return await this.solicitudService.getTaskCounts(usuario);
    } catch (error) {
      console.error('Error en el controlador getTaskCounts:');
      throw error;
    }
  }*/

  @Public()
  @Post('contador-solicitudes')
  async getTaskCounts(@Body() datos: ContadorGestionDto) {
    try {
      return await this.solicitudService.getTaskCounts(datos);
    } catch (error) {
      console.error('Error en el controlador getTaskCounts:');
      throw error;
    }
  } 
  
  @Public()
  @Post('usuario-asignado-obra')
  usuarioAsignadoObra(@Body() usuarioDto: UsuarioSolicitudObraDto) {
    try {
      return this.solicitudService.usuarioAsignadoObra(usuarioDto);
    } catch (error) {
    }
  }


  ////////////////////////////SOLICITUD HISTORIAL/////////////////////////////////////
  @Public()
  @Post('crear-solicitud-historial')
  createSolHistorial(@Body() createSolicitudHistorialDto: CreateSolicitudHistorialDto) {
    try {
      return this.solicitudService.createHistorial(createSolicitudHistorialDto);
    } catch (error) {
    }
  }


  @Public()
  @Patch('update-solicitud-historial/:id')
  updateHistorial(@Param('id') id: string, @Body() updateSolicitudHistorialDto: UpdateSolicitudHistorialDto) {
    return this.solicitudService.updateHistorial(+id, updateSolicitudHistorialDto);
  }


  @Public()
  @Post('historial-solcitud-x-obra')
  listaHistorialXobra(@Body() data: HistorialObraDto) {
    try {
    return this.solicitudService.listaHistorialXObra( data);
  } catch (error) {
  }    
  }
  

  @Public()
  @Post('historial-solcitud')
  listaHistorialXSolicitud(@Body() data: HistorialSolicitudDto) {
    try {
    return this.solicitudService.listaHistorialXSolicitud( data);
  } catch (error) {
  }    
  }


  @Public()
  @Post('usuario-solicitud-obra')
  usuarioSolicitudXObra(@Body() usuarioDto: UsuarioSolicitudXObraDto) {
    try {
      return this.solicitudService.usuarioSolicitudXObra(usuarioDto);
    } catch (error) {
    }
  } 

}
