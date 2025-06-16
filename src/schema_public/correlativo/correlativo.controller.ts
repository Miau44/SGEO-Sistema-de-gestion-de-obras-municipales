import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CorrelativoService } from './correlativo.service';
import { CreateCorrelativoDto } from './dto/create-correlativo.dto';
import { UpdateCorrelativoDto } from './dto/update-correlativo.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { TipoInformeDto } from './dto/tipo_informe.dto';

@ApiTags('correlativo')
@Controller('correlativo')
export class CorrelativoController {
  constructor(private readonly correlativoService: CorrelativoService) {}

  @Public()
  @Post()
  create(@Body() createCorrelativoDto: CreateCorrelativoDto) {
    try {
    return this.correlativoService.create(createCorrelativoDto);
  } catch (error) {
  }
  }

  @Get()
  findAll() {
    return this.correlativoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.correlativoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCorrelativoDto: UpdateCorrelativoDto) {
    return this.correlativoService.update(+id, updateCorrelativoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.correlativoService.remove(+id);
  }

    @Public()
  @Post()
  createNormal(@Body() createCorrelativoDto: CreateCorrelativoDto) {
    try {
    return this.correlativoService.createNormal(createCorrelativoDto);
  } catch (error) {
  }
  }


    @Public()
  @Post('actualizar-correlativo')
  actualizarCorrelativo(@Body() data: TipoInformeDto) {
    try {
    return this.correlativoService.actualizarFaltantes(data);
  } catch (error) {
  }
  }

}
