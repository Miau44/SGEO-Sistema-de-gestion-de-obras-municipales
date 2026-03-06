import { Controller, Post, Body, Get, Put, Param, ParseIntPipe,} from '@nestjs/common';
import { ArchivoActaService } from './archivo_acta.service';
import { CreateArchivoActaDto } from './dto/create-archivo_acta.dto';
import { UpdateArchivoActaDto } from './dto/update-archivo_acta.dto';

@Controller('archivo-acta')
export class ArchivoActaController {
  constructor(
    private readonly archivoActaService: ArchivoActaService,
  ) {}

  //  CREAR ARCHIVO ACTA
  @Post()
  async create(@Body() dto: CreateArchivoActaDto) {
    return await this.archivoActaService.create(dto);
  }

  //  LISTAR TODOS (id_estado = 1)
  @Get()
  async findAll() {
    return await this.archivoActaService.findAll();
  }

  //  OBTENER UNO POR ID
  @Get(':id')
  async findOne(
  @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.archivoActaService.findOne(id);
  }

  @Put(':id_archivo_acta')
guardar(
  @Param('id_archivo_acta', ParseIntPipe) id: number,
  @Body() dto: UpdateArchivoActaDto,
) {
  return this.archivoActaService.guardar(id, dto);
}
}