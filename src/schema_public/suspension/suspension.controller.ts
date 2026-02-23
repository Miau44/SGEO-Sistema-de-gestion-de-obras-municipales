import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SuspensionService } from './suspension.service';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { UpdateSuspensionDto } from './dto/update-suspension.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { SuspensionObraDto } from './suspension-obra.dto';
import { CreateReinicioDto } from './dto/dto-reinicio/create-reinicio.dto';
import { UpdateReinicioDto } from './dto/dto-reinicio/update-reinicio.dto';


@ApiTags('suspension')
@Controller('suspension')
export class SuspensionController {
  constructor(private readonly suspensionService: SuspensionService) { }

  @Post()
  create(@Body() createSuspensionDto: CreateSuspensionDto) {
    try {
      return this.suspensionService.create(createSuspensionDto);
    } catch { }
  }

  @Get()
  findAll() {
    try {
      return this.suspensionService.findAll();
    } catch (error) { }
  }


  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      return this.suspensionService.findOne(+id);
    } catch (error) { }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSuspensionDto: UpdateSuspensionDto) {
    try {
      return this.suspensionService.update(+id, updateSuspensionDto);
    } catch { }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suspensionService.remove(+id);
  }



  @Public()
  @Post('lista-suspension')
  listaSuspension(@Body() data: SuspensionObraDto) {
    try {
      return this.suspensionService.listaSupension(data);
    } catch (error) {
    }
  }

  @Public()
  @Post('lista-suspension-obra')
  listaSuspensionCodigo(@Body() data: SuspensionObraDto) {
    try {
      return this.suspensionService.listaSupensionXObra(data);
    } catch (error) {
    }
  }

  @Public()
  @Post('lista-suspension-hijos_totales')
  listaSuspensionHijosTotal(@Body() data: { id_obra: number; id_total: number }) {
    return this.suspensionService.listaHijosTotal(data);
  }

  @Public()
  @Get('validar-total/:id_obra')
  validarTotal(@Param('id_obra') id_obra: string) {
    return this.suspensionService.puedeCrearTotal(+id_obra);
  }

  @Public()
  @Get('validar-bloqueo-nueva-suspension/:id_obra')
  validarBloqueo(@Param('id_obra') id_obra: string) {
    return this.suspensionService.validarBloqueoNuevaSuspension(+id_obra);
  }

  @Post('create-reinicio')
  createReinicio(@Body() createReinicioDto: CreateReinicioDto) {
    try {
      return this.suspensionService.createReinicio(createReinicioDto);
    } catch { }
  }

  @Public()
  @Post('lista-suspension-para-reinicio')
  listaSuspensionParaReinicio(@Body() data: { id_obra: number; id_suspension: number }) {
    return this.suspensionService.listaSuspensionParaReinicio(data);
  }


  @Patch('update-reinicio/:id')
  updateReinicio(@Param('id') id: string, @Body() updateReinicioDto: UpdateReinicioDto) {
    try {
      return this.suspensionService.updateReinicio(+id, updateReinicioDto);
    } catch { }
  }

  @Public()
  @Get('buscar-reinicio/:id')
  findOneReinicio(@Param('id') id: string) {
    try {
      return this.suspensionService.findOneReinicio(+id);
    } catch (error) { }
  }

}
