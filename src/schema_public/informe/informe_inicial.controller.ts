import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InformeService } from './informe_inicial.service';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { ResponseService } from 'src/response.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ListaInformeDto } from './dto/lista-informe.dto';
import { CreateInformeInicialDto } from './dto/create-informe-inicial.dto';
import { UpdateInformeInicialDto } from './dto/update-informe-inicial.dto';
import { InformeObraDto } from './dto/informe-obra.dto';
import { InformeOpcionDto } from './dto/informe-opcion.dto';


@ApiTags('informe')
@Controller('informe')
export class InformeController {
  constructor(private readonly informeService: InformeService) { }

  @Public()
  @Post()
  create(@Body() createInformeDto: CreateInformeDto) {
    try {
      return this.informeService.create(createInformeDto);
    } catch (error) { }
  }

  @Public()
  @Get()
  findAll() {
    try {
      return this.informeService.findAll();
    } catch (error) { }

  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInformeDto: UpdateInformeDto) {
    try {
      return this.informeService.update(+id, updateInformeDto);
    } catch (error) {
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informeService.remove(+id);
  }


  @Public()
    @Post('lista-informe-inicial')
    listaInformeInicial(@Body() informeDto: ListaInformeDto) {
      try {  
        return this.informeService.listaInformeInicial(informeDto);
      } catch (error) {
      }
    } 
    
    
    @Public()
    @Post('informe-inicial')
    createInformeIncial(@Body() createInfInformeDto: CreateInformeInicialDto) {
      try {
        return this.informeService.createInformeInicial(createInfInformeDto);
      } catch (error) { }
    }


  @Patch('informe-inicial:id')
  updateInformeInicial(@Param('id') id: string, @Body() updateInformeInicialDto: UpdateInformeInicialDto) {
    try {
      return this.informeService.updateInformeInicial(+id, updateInformeInicialDto);
    } catch (error) {
    }
  }


  /*@Public()
  @Post('si-existe-informe')
  async siExisteInforme(@Body() data: InformeObraDto): Promise<boolean> {
    return this.informeService.siExisteInforme(data);
  }    */


  @Public()
  @Post('si-existe-informe')
  siExisteInforme(@Body() data: InformeObraDto) {
    try {
      return this.informeService.siExisteInforme(data);
    } catch (error) { }
  }

  @Public()
  @Post('informe-opcion')
  listaOpcionesInforme(@Body() opcionInformeDto: InformeOpcionDto) {
    try {
      return this.informeService.listaOpcionesInforme(opcionInformeDto);
    } catch (error) { }
  }

      
}
