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
import { ObraIdDto } from './dto/obraDto.dto';
import { ObraSolicitudesDto } from './dto/obra-solicitudes.dto';
import { MisProyectoDto } from './dto/mis-proyectos.dto';
import { UpdateCoordenadasObraDto } from './dto/updateCoordenadasObra.dto';
import { CronogramaGestionDto } from './dto/cronograma-gestion.dto';

@ApiTags('obra')
@Controller('obra')
export class ObraController {
  constructor(private readonly obraService: ObraService) { }


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
  @Post('listar-obras-sol')
  listarObras(@Body() estadoDto: ObraSolicitudesDto) {
    try {
      return this.obraService.listarObrasXSolicitudes(estadoDto);
    } catch (error) {
    }
  }

  @Public()
  @Patch(':id_obra')
  actualizar(@Param('id_obra') id_obra: string, @Body() tipoObraModDto: TipoObraModObraDto) {
    return this.obraService.actualizar(+id_obra, tipoObraModDto);
  }

  @Public()
  @Post('si-existe-persona')
  async siExistePersonaMenos1y2(@Body() data: ObraIdDto): Promise<boolean> {
    return this.obraService.siExistePersonaMenos1y2(data);
  }

  @Public()
  @Post('listar-mis-proyectos')
  misProyectos(@Body() misproyDto: MisProyectoDto) {
    try {
      return this.obraService.listaMisProyectos(misproyDto);
    } catch (error) {
    }
  }

  @Public()
  @Patch('cambiar-estado/:id_obra')
  cambiarEstadoGeneral(
    @Param('id_obra') id_obra: string,
    @Body() body: { id_estado_general: number }
  ) {
    return this.obraService.cambiarEstadoGeneral(+id_obra, body.id_estado_general);
  }

  @Public()
  @Get(':id_obra/reporte-resumen')
  getReporteResumenObra(@Param('id_obra') id_obra: string) {
    return this.obraService.getReporteResumenObra(+id_obra);
  }

  @Public()
  @Patch(':id_obra/coordenadas')
  updateCoordenadas(
    @Param('id_obra') id: string,
    @Body() dto: UpdateCoordenadasObraDto
  ) {
    return this.obraService.updateCoordenadas(+id, dto);
  }

  // VISTACRONORGRAMA
  @Public()
  @Post('reporte/general-cronograma-obras') // <-- Cambiado a Post
  reporteGeneralCronogramaObras(@Body() cronogramaDto: CronogramaGestionDto) {
      return this.obraService.reporteGeneralCronogramaObras(cronogramaDto);
  }


  //filtros UnidadEjecutora
  @Public()
  @Get('reporte/lista-unidades-ejecutoras') // <--- El nuevo prefijo estático para el filtro
  listarUnidadesEjecutoras() {
    return this.obraService.listarUnidadesEjecutoras();
  }

  @Public()
  @Get('listar-obras-247/:correlativo_carpeta')
  listarObras247(@Param('correlativo_carpeta') correlativo_carpeta: number) {
    console.log(correlativo_carpeta);
    
    return this.obraService.consultarDatosDeSqlServer(correlativo_carpeta);
  }
}
