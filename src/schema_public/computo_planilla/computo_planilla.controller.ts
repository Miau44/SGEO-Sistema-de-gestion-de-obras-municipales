import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComputoPlanillaService } from './computo_planilla.service';
import { CreateComputoDto } from './dto/create-computo.dto';
import { UpdateComputoDto } from './dto/update-computo.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ComputoObra } from './dto/computo-obra.dto';


@ApiTags('computo-planilla')
@Controller('computo-planilla')
export class ComputoPlanillaController {
  constructor(private readonly computoPlanillaService: ComputoPlanillaService) {}

  @Public()  
  @Post('computo-create')
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
  listaDocumentos(@Body() computoObraDto: ComputoObra) {
    try {  
      return this.computoPlanillaService.listaItemComputoXObra(computoObraDto);
    } catch (error) {
    }
  }



}
