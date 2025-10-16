import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, NotFoundException, Put } from '@nestjs/common';
import { DesignacionService } from './designacion.service';
import { CreateDesignacionDto } from './dto/create-designacion.dto';
import { UpdateDesignacionDto } from './dto/update-designacion.dto';
import { ApiOperation,ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';
import { EstadoObraDesigDto } from './dto/estado_obra_designacion.dto';
import { MaxCorrelativoDto } from './dto/correlativo.dto';
import { ReemplazoDto } from './dto/reemplazo.dto';
import { GenerarDto } from './dto/generar.dto';
import { Designacion } from './entities/designacion.entity';
import { TraspasoPendientesDto } from './dto/traspaso_pendientes.dto';


@ApiTags('designacion')

@Controller('designacion')
export class DesignacionController {
  constructor(private readonly designacionService: DesignacionService) {}


  //controlador mike para el rechazo
  @Get('pendientes')
  async obtenerDesignacionesPendientes(): Promise<Designacion[]> {
    const resultado = await this.designacionService.obtenerDesignacionesPendientes();
    //console.log('🔍 Datos obtenidos:', resultado); // 👀 Verificar en consola del backend
    return resultado;
  }
  

  @Post('rechazar')
  async rechazarSolicitudes2(@Body() data: { estado_designacion: number; id_tipo_solicitud: number }) {
   
    return this.designacionService.rechazarSolicitudes2(data.estado_designacion, data.id_tipo_solicitud);
  }
  

  @Get('/solicitud/:id_designacion')
async getSolicitud(@Param('id_designacion') id_designacion: number) {
  const id_solicitud = await this.designacionService.getSolicitudByDesignacion(id_designacion);
  
  if (!id_solicitud) {
    throw new NotFoundException(`No se encontró solicitud para designación ${id_designacion}`);
  }

  return { id_solicitud };
}



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

  @Patch('traspasar-bandeja-pendientes')
  @ApiOperation({ summary: 'Traspasar bandeja por usuarios (simular o ejecutar)' })
  async traspasarBandeja(@Body() dto: TraspasoPendientesDto) {
    // si tenés auth, saca el ejecutor de req.user; aquí no lo usamos.
    return this.designacionService.traspasarBandejaPorUsuarios(dto);
  }

  @Post('bandeja/resumen')
  async resumenPendientes(@Body() dto: TraspasoPendientesDto) {
    return this.designacionService.resumenPendientes(dto);
  }

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

  /*@Public()
  @Patch('aprobar/:id_designacion')
  actualizarAprobar(@Param('id_designacion') id_designacion: string, @Body() actEstadoDto: EstadoObraDesigDto) {
    return this.designacionService.aprobarDesignacionbien(+id_designacion, actEstadoDto);
  }*/

  @Public()
  @Post('aprobar-designacion')
  actualizarAprobarDessignacion(@Body() actEstadoDto: EstadoObraDesigDto) {
    return this.designacionService.aprobarDesignacion( actEstadoDto);
  }

//mike

@Public()
@Post('aprobar-designacionR')
actualizarAprobarDessignacionR(@Body() actEstadoDto: EstadoObraDesigDto) {
  return this.designacionService.aprobarDesignacionR( actEstadoDto);
}

  @Public()
  @Get('rechazar/:id_designacion/:obra')
  @ApiOperation({ summary: ' id_designacion:1' })
  rechazarDesignacion(@Param('id_designacion') id_designacion: number, @Param('obra') obra: number) {
    return this.designacionService.rechazarDesignacion(+id_designacion, obra);
  }

  @Public()
  @Post('max-correlativo')
  MaxCorrelativo(@Body() correlativoDto: MaxCorrelativoDto ) {
    try {
      return this.designacionService.maxCorrelativo(correlativoDto);
    } catch (error) {
    }
  }

  //para reemplazar
  @Public()
  @Patch('reemplazar/:id_designacion')
  actualizarReemplazar(@Param('id_designacion') id_designacion: string, @Body() reemplazoDto: ReemplazoDto) {
    return this.designacionService.actualizarReemplazar(+id_designacion, reemplazoDto);
  }

  @Public()
  @Post('generar')
  generar(@Body() correlativoDto: GenerarDto ) {
    try {
      return this.designacionService.generarSolicitud(correlativoDto);
    } catch (error) {
    }
  }


  //mike
  @Patch('reemplazarM/:id')
  async reemplazarDesignacion(@Param('id', ParseIntPipe) idDesignacionNueva: number) {
    return await this.designacionService.reemplazarDesignacion(idDesignacionNueva);
  }

  @Get('obtenerSolicitudId/:id_designacion')
  async obtenerIdSolicitud(@Param('id_designacion') id_designacion: number) {
    return this.designacionService.buscarIdSolicitud(id_designacion);
  }
 

  @Put('actualizar-solicitudes-supervisores')
  async actualizarSolicitudesSupervisores() {
    return await this.designacionService.actualizarEstadoSolicitudesSupervisores();
  }
  @Put('actualizar-solicitudes-fiscales')
  async actualizarSolicitudesFiscales() {
    return await this.designacionService.actualizarEstadoSolicitudesFiscales();
  }
}
