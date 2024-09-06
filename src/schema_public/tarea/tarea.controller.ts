import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TareaService } from './tarea.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

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

  @Get()
  findAll() {
    return this.tareaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tareaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTareaDto: UpdateTareaDto) {
    return this.tareaService.update(+id, updateTareaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tareaService.remove(+id);
  }
}
