import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstanciaTareaService } from './instancia_tarea.service';
import { CreateInstanciaTareaDto } from './dto/create-instancia_tarea.dto';
import { UpdateInstanciaTareaDto } from './dto/update-instancia_tarea.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('instancia-tarea')
@Controller('instancia-tarea')
export class InstanciaTareaController {
  constructor(private readonly instanciaTareaService: InstanciaTareaService) {}

  @Public()
  @Post()
  create(@Body() createInstanciaTareaDto: CreateInstanciaTareaDto) {
    return this.instanciaTareaService.create(createInstanciaTareaDto);
  }

  @Get()
  findAll() {
    return this.instanciaTareaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instanciaTareaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstanciaTareaDto: UpdateInstanciaTareaDto) {
    return this.instanciaTareaService.update(+id, updateInstanciaTareaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instanciaTareaService.remove(+id);
  }
}
