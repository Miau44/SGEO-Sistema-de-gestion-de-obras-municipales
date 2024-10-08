import {
    Controller,
    Get,
    Body,
    Post,
    Patch,
    Delete,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
  
import { ListaParametricaService } from './../services/lista_parametrica.service';
import { CreateListaParametricaDto, UpdateListaParametricaDto } from './../dto/lista_parametrica.dto';

@ApiTags('Lista-Parametrica')
@Controller('lista-parametrica')
export class ListaParametricaController {
  constructor(private listaParametricaService: ListaParametricaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar lista-parametrica' })
  getAll() {
    return this.listaParametricaService.findAll();
  }

  @ApiOperation({ summary: 'Listar una lista-parametrica' })
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.listaParametricaService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una lista-parametrica' })
  create(@Body() payload: CreateListaParametricaDto) {
    return this.listaParametricaService.create(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar lista-parametrica' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateListaParametricaDto,
  ) {
    return this.listaParametricaService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una lista-parametrica' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.listaParametricaService.delete(id);
  }
}
