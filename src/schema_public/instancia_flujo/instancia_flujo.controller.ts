import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstanciaFlujoService } from './instancia_flujo.service';
import { CreateInstanciaFlujoDto } from './dto/create-instancia_flujo.dto';
import { UpdateInstanciaFlujoDto } from './dto/update-instancia_flujo.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { AvanzarDto } from './dto/avanzar.dto';

@ApiTags('instancia-flujo')
@Controller('instancia-flujo')
export class InstanciaFlujoController {
  constructor(private readonly instanciaFlujoService: InstanciaFlujoService) {}

  @Public()
  @Post()
  create(@Body() createInstanciaFlujoDto: CreateInstanciaFlujoDto) {
    try {
    return this.instanciaFlujoService.create(createInstanciaFlujoDto);
  } catch (error) {
  }
  }

  @Get()
  findAll() {
    return this.instanciaFlujoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instanciaFlujoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstanciaFlujoDto: UpdateInstanciaFlujoDto) {
    return this.instanciaFlujoService.update(+id, updateInstanciaFlujoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instanciaFlujoService.remove(+id);
  }


 /* @Public()
  @Post('iniciar')
  iniciarFlujo(@Body() createInstanciaFlujoDto: CreateInstanciaFlujoDto) {
    try {
    return this.instanciaFlujoService.iniciarFlujo(createInstanciaFlujoDto);
  } catch (error) {
  }
  }*/

  @Public()
  @Post('iniciar')
  iniciarFlujo(@Body() createInstanciaFlujoDto: CreateInstanciaFlujoDto) {
    try {
      return this.instanciaFlujoService.iniciarFlujo(createInstanciaFlujoDto);
    } catch (error) {
    }
  }

  
  @Public()
  @Post('avanzar')
  avanzarTarea(@Body() avanzarDto: AvanzarDto) {
    try {
      return this.instanciaFlujoService.avanzarTarea(avanzarDto);
    } catch (error) {
    }
  }

}
