import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComputoPlanillaService } from './computo_planilla.service';
import { CreateComputoDto } from './dto/create-computo.dto';
import { UpdateComputoDto } from './dto/update-computo.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ComputoObra } from './dto/computo-obra.dto';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { ComputoItem } from './dto/computo-Item.dto';

@ApiTags('computo-planilla')
@Controller('computo-planilla')
export class ComputoPlanillaController {
  constructor(private readonly computoPlanillaService: ComputoPlanillaService) {}

  @Public()
  @Post('create-computo')
  async  create(@Body() createComputoPlanillaDto: CreateComputoDto) {
    return this.computoPlanillaService.create(createComputoPlanillaDto);
  }

  @Public()    
  @Get()
  findAll() {
    return this.computoPlanillaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.computoPlanillaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComputoPlanillaDto: UpdateComputoDto) {
    return this.computoPlanillaService.update(+id, updateComputoPlanillaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.computoPlanillaService.remove(+id);
  }



  @Public()
  @Post('computo-lista')
  listaItem(@Body() computoObraDto: ComputoObra) {
    try {  
      return this.computoPlanillaService.listaItemComputoXObra(computoObraDto);
    } catch (error) {
    }
  }

  @Public()
  @Post('computo-x-item')
  listaComputoItem(@Body() computoItemDto: ComputoItem) {
    try {  
      return this.computoPlanillaService.listaComputoXItem(computoItemDto);
    } catch (error) {
    }
  }

  ///////////////////////PLANILLA/////////////////////////

  @Public()
  @Post('planilla-create')
  async  createPlanilla(@Body() planilla: CreatePlanillaDto) {
    return this.computoPlanillaService.createPlanilla(planilla);
  }  

  ///////////////////////CRITERIO/////////////////////////

  @Public()
  @Get('criterio-lista')
  findAllCriterio() {
    try {
      return this.computoPlanillaService.findAllCriterio();
    } catch (error) {
    }    
  }  
}
