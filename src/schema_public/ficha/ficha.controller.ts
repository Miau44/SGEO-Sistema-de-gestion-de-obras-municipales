import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { FichaService } from './ficha.service';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { EstructuraFichaDto } from './dto/estructura-fichaDto';
import { ResponseService } from 'src/response.service';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';



@Controller('ficha')
export class FichaController {
  constructor(private readonly fichaService: FichaService, private responseService:ResponseService) {}

  @Public()
  @Post()
  create(@Body() createFichaDto: CreateFichaDto) {
    try {
    return this.fichaService.create(createFichaDto);
  } catch (error) {
  }
  }

  @Get()
  findAll() {
    try {
    return this.fichaService.findAll();
  } catch (error) {
  }      
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    try {    
    return this.fichaService.findOne(+id);
  } catch (error) {
  }    
  }
  
  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFichaDto: UpdateFichaDto) {
    return this.fichaService.update(+id, updateFichaDto);
  }

  // @Public()
  // @Patch(':id_ficha')
  // actualizar(@Param('id_ficha') id_ficha: string, @Body() tipoObraModDto: TipoObraModDto) {
  //   return this.fichaService.actualizar(+id_ficha, tipoObraModDto);
  // }  

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fichaService.remove(+id);
  }

  @Public()
  @Post('listar')
  listarObraXUe(@Body() estructuraDto: EstructuraFichaDto) {
    try {
      return this.fichaService.listarFichaXUe(estructuraDto);
    } catch (error) {
    }
  }

  @Public()
  @Post('listar-validadas')
  listarObraXUeVal(@Body() estructuraDto: EstructuraFichaDto) {
    try {
      return this.fichaService.listarFichaXUeValidadas(estructuraDto);
    } catch (error) {
    }
  }  

    
    @Public()
    @UseGuards(AuthGuard('jwt'))
    @Get('listadoxficha/:cod_carpeta')
    @HttpCode(HttpStatus.OK)
    async listadoxficha(@Param('cod_carpeta') id_carpeta?: number) {
      try {
        console.log(id_carpeta);
        id_carpeta = id_carpeta == null ? 0 : id_carpeta;
        return this.fichaService.listado(id_carpeta);
      } catch (error) {
        console.log(error);
      }
    }
}
