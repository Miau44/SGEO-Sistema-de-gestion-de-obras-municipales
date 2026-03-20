import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ArchivoActaService } from './archivo_acta.service';
import { CreateArchivoActaDto } from './dto/create-archivo_acta.dto';
import { UpdateArchivoActaDto } from './dto/update-archivo_acta.dto';

@Controller('archivo-acta')
export class ArchivoActaController {
  constructor(
    private readonly archivoActaService: ArchivoActaService,
  ) {}

  // ============================
  // CREAR
  // ============================
  @Post()
  async create(@Body() dto: CreateArchivoActaDto) {
    return this.archivoActaService.create(dto);
  }

  // ============================
  // 🔥 RUTAS ESPECÍFICAS (PRIMERO)
  // ============================

 @Get('ultimo/:id_informe/:tipo')
getUltimo(
  @Param('id_informe', ParseIntPipe) id_informe: number,
  @Param('tipo', ParseIntPipe) tipo: number,
) {
  return this.archivoActaService.getUltimoPorInforme(id_informe, tipo);
}

  @Get('destino-salida/:id_informe/:tipo')
  async obtenerDestinoSalida(
    @Param('id_informe', ParseIntPipe) id_informe: number,
    @Param('tipo', ParseIntPipe) tipo: number,
  ) {
    return this.archivoActaService.obtenerDestinoSalida(
      id_informe,
      tipo,
    );
  }

  // ============================
  // GENERALES
  // ============================

  @Get()
  async findAll() {
    return this.archivoActaService.findAll();
  }

  // ============================
  // 🔥 RUTA GENÉRICA (AL FINAL)
  // ============================

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.archivoActaService.findOne(id);
  }

  @Put(':id_archivo_acta')
  guardar(
    @Param('id_archivo_acta', ParseIntPipe) id: number,
    @Body() dto: UpdateArchivoActaDto,
  ) {
    return this.archivoActaService.guardar(id, dto);
  }
}