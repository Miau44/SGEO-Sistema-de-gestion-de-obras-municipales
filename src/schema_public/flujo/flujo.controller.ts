import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlujoService } from './flujo.service';
import { CreateFlujoDto } from './dto/create-flujo.dto';
import { UpdateFlujoDto } from './dto/update-flujo.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';





@ApiTags('flujo')
@Controller('flujo')
export class FlujoController {
  constructor(private readonly flujoService: FlujoService) {}

  @Public()  
  @Post()
  create(@Body() createFlujoDto: CreateFlujoDto) {
    try {
    return this.flujoService.create(createFlujoDto);
  } catch (error) {
  }    
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
