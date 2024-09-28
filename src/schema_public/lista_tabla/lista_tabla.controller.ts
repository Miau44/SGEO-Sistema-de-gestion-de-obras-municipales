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
  
import { ListaTablaService } from './lista_tabla.service';
import { CreateListaTablaDto, UpdateListaTablaDto } from './dto/lista_tabla.dto';

@ApiTags('Lista Tabla')
@Controller('lista-tabla')
export class ListaTablaController {
  constructor(private listaTablaService: ListaTablaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar lista-tabla' })
  getAll() {
    return this.listaTablaService.findAll();
  }

  @ApiOperation({ summary: 'Listar una lista-tabla' })
  @Get(':id_lista_tabla')
  getOne(@Param('id_lista_tabla', ParseIntPipe) id_lista_tabla: number) {
    return this.listaTablaService.findOne(id_lista_tabla);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una lista-tabla' })
  create(@Body() payload: CreateListaTablaDto) {
    return this.listaTablaService.create(payload);
  }

  @Patch(':id_lista_tabla')
  @ApiOperation({ summary: 'Actualizar lista-tabla' })
  update(
    @Param('id_lista_tabla', ParseIntPipe) id_lista_tabla: number,
    @Body() payload: UpdateListaTablaDto,
  ) {
    return this.listaTablaService.update(id_lista_tabla, payload);
  }

  @Delete(':id_lista_tabla')
  @ApiOperation({ summary: 'Eliminar una lista-tabla' })
  delete(@Param('id_lista_tabla', ParseIntPipe) id_lista_tabla: number) {
    return this.listaTablaService.delete(id_lista_tabla);
  }
}
