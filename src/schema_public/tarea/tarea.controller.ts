import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TareaService } from './tarea.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { FlujoTareaDto } from './dto/flujo.dto';

@ApiTags('tarea')
@Controller('tarea')
export class TareaController {
  constructor(private readonly tareaService: TareaService) {}

  @Public()
  @Post()
  create(@Body() createTareaDto: CreateTareaDto) {
    try{
    return this.tareaService.create(createTareaDto);
  } catch (error) {
  }    
  }

  @Public()  
  @Get()
  findAll() {
    try {
    return this.tareaService.findAll();
  } catch (error) {
  }       
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tareaService.findOne(+id);
  }
  @Public()
  @Patch(':id')

  update(@Param('id') id: string, @Body() updateTareaDto: UpdateTareaDto) {
    try {  
    return this.tareaService.update(+id, updateTareaDto);
  } catch (error) {
  } 
  }

  @Public()
  @Delete(':id')
  async eliminarFlujo(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      return this.tareaService.eliminarTarea(id);
    } catch (error) {
    }
  }


  @Public()  
  @Post('tareas-x-flujo')
  tareaXFlujo(@Body() flujo: FlujoTareaDto) {
    try {
    return this.tareaService.tareasxFlujo(flujo);
  } catch (error) {
  }       
  }

 /* @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tareaService.remove(+id);
  }*/
}
