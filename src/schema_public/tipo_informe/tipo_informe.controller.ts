import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoInformeService } from './tipo_informe.service';
import { CreateTipoInformeDto } from './dto/create-tipo_informe.dto';
import { UpdateTipoInformeDto } from './dto/update-tipo_informe.dto';
import { ResponseService } from 'src/response.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('tipo-informe')
@Controller('tipo-informe')
export class TipoInformeController {
  constructor(private readonly tipoInformeService: TipoInformeService) {}

  @Post()
  create(@Body() createTipoInformeDto: CreateTipoInformeDto) {
    try {    
    return this.tipoInformeService.create(createTipoInformeDto);
  } catch (error) {
  }    
  }

  @Public()
  @Get()
  findAll() {
    try {
      return this.tipoInformeService.findAll();
    } catch (error) {
    }    
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoInformeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoInformeDto: UpdateTipoInformeDto) {
    return this.tipoInformeService.update(+id, updateTipoInformeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoInformeService.remove(+id);
  }
}
