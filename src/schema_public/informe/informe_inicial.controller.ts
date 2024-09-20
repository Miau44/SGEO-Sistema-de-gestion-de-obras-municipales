import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InformeInicialService } from './informe_inicial.service';
import { CreateInformeInicialDto } from './dto/create-informe_inicial.dto';
import { UpdateInformeInicialDto } from './dto/update-informe_inicial.dto';
import { ResponseService } from 'src/response.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('informe')
@Controller('informe')
export class InformeInicialController {
  constructor(private readonly informeInicialService: InformeInicialService) { }

  @Public()
  @Post()
  create(@Body() createInformeInicialDto: CreateInformeInicialDto) {
    try {
      return this.informeInicialService.create(createInformeInicialDto);
    } catch (error) { }
  }

  @Public()
  @Get()
  findAll() {
    try {
      return this.informeInicialService.findAll();
    } catch (error) { }

  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informeInicialService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInformeInicialDto: UpdateInformeInicialDto) {
    try {
      return this.informeInicialService.update(+id, updateInformeInicialDto);
    } catch (error) {
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informeInicialService.remove(+id);
  }
}
