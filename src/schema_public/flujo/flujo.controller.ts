import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FlujoService } from './flujo.service';
import { CreateFlujoDto } from './dto/create-flujo.dto';
import { UpdateFlujoDto } from './dto/update-flujo.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';





@ApiTags('flujo')
@Controller('flujo')
export class FlujoController {
  constructor(private readonly flujoService: FlujoService) { }

  @Public()
  @Post()
  create(@Body() createFlujoDto: CreateFlujoDto) {
    try {
      return this.flujoService.create(createFlujoDto);
    } catch (error) {
    }
  }
  @Public()
  @Get()
  findAll() {
    try {
      return this.flujoService.findAll();
    } catch (error) {
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flujoService.findOne(+id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFlujoDto: UpdateFlujoDto) {
    try {
      return this.flujoService.update(+id, updateFlujoDto);
    } catch (error) {
    }
  }


  @Public()
  @Delete(':id')
  async eliminarFlujo(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      return this.flujoService.eliminarFlujo(id);
    } catch (error) {
    }
  }

  /* @Delete(':id')
   remove(@Param('id') id: string) {
     return this.flujoService.remove(+id);
   }*/
}
