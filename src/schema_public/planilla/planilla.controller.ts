import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanillaService } from './planilla.service';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { copiarItemDto } from './dto/planilla-item.dto';
import { error } from 'console';
import { actualizarJustificacionDto } from './dto/actualizar-justificacion.dto';
import { actualizarPlanillaDto } from './dto/actualizar-planilla.dto';
@ApiTags('planilla')
@Controller('planilla')
export class PlanillaController {
  constructor(private readonly planillaService: PlanillaService) {}

  @Post()
  create(@Body() createPlanillaDto: CreatePlanillaDto) {
    try{
    return this.planillaService.create(createPlanillaDto);
  }catch {}
  }

  @Get()
  findAll() {
    return this.planillaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planillaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanillaDto: UpdatePlanillaDto) {
    try{    
    return this.planillaService.update(+id, updatePlanillaDto);
  }catch {error}    
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planillaService.remove(+id);
  }

  @Public()
  @Post('copiar-item')
  planillaItem(@Body() copiarItemDto: copiarItemDto) {
    try {  
      return this.planillaService.copiarItem(copiarItemDto);
    } catch (error) {
    }
  }

  @Public()
  @Post('editar-item')
  actualizarJustificacion(@Body() copiarItemDto: actualizarJustificacionDto) {
    try {  
      return this.planillaService.actualizarJustificacionXItem(copiarItemDto);
    } catch (error) {
    }
  }

  @Public()
  @Post('actualizar-planilla')
  actualizarPlanilla(@Body() data: actualizarPlanillaDto) {
    try {  
      return this.planillaService.actualizarPlanilla(data);
    } catch (error) {
    }
  }  

}
