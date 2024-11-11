import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GarantiaSeguroService } from './garantia_seguro.service';
import { CreateGarantiaSeguroDto } from './dto/create-garantia_seguro.dto';
import { UpdateGarantiaSeguroDto } from './dto/update-garantia_seguro.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Garantia Seguro')
@Controller('garantia-seguro')
export class GarantiaSeguroController {
  constructor(private readonly garantiaSeguroService: GarantiaSeguroService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva garantía de seguro' })
  @ApiResponse({ status: 201, description: 'Garantía creada exitosamente.' })
  async create(@Body() createGarantiaSeguroDto: CreateGarantiaSeguroDto) {
    return await this.garantiaSeguroService.create(createGarantiaSeguroDto);
  }

  @Get('garantia')
  @ApiOperation({ summary: 'Obtener todas las garantías de seguro' })
  @ApiResponse({ status: 200, description: 'Lista de garantías de seguro.' })
  async findAllGaranti() {
      return await this.garantiaSeguroService.findAllGarantias();
  }

  @Get('seguro')
  @ApiOperation({ summary: 'Obtener todas las garantías de seguro' })
  @ApiResponse({ status: 200, description: 'Lista de garantías de seguro.' })
  async findAllSegur() {
      return await this.garantiaSeguroService.findAllSeguros();
  }

  @Get('subtipos')
  async getSubtipos(@Query('descTipo') descTipo: string) {
    return this.garantiaSeguroService.listarSubtiposPorTipo(descTipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una garantía de seguro por ID' })
  @ApiResponse({ status: 200, description: 'Garantía de seguro encontrada.' })
  async findOne(@Param('id') id: number) {
    return await this.garantiaSeguroService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una garantía de seguro' })
  @ApiResponse({ status: 200, description: 'Garantía de seguro actualizada exitosamente.' })
  @ApiBody({ type: UpdateGarantiaSeguroDto })
  async update(@Param('id') id: number, @Body() updateGarantiaSeguroDto: UpdateGarantiaSeguroDto) {
    return await this.garantiaSeguroService.update(id, updateGarantiaSeguroDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una garantía de seguro' })
  @ApiResponse({ status: 200, description: 'Garantía de seguro eliminada exitosamente.' })
  async remove(@Param('id') id: number) {
    return await this.garantiaSeguroService.remove(id);
  }
}
