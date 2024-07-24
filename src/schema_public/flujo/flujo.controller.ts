import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlujoService } from './flujo.service';
import { CreateFlujoDto } from './dto/create-flujo.dto';
import { UpdateFlujoDto } from './dto/update-flujo.dto';

@Controller('flujo')
export class FlujoController {
  constructor(private readonly flujoService: FlujoService) {}

  @Post()
  create(@Body() createFlujoDto: CreateFlujoDto) {
    return this.flujoService.create(createFlujoDto);
  }

  @Get()
  findAll() {
    return this.flujoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flujoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFlujoDto: UpdateFlujoDto) {
    return this.flujoService.update(+id, updateFlujoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flujoService.remove(+id);
  }
}
