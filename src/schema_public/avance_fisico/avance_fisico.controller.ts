import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AvanceFisicoService } from './avance_fisico.service';
import { CreateAvanceFisicoDto } from './dto/create-avance_fisico.dto';
import { UpdateAvanceFisicoDto } from './dto/update-avance_fisico.dto';
import { ApiTags } from '@nestjs/swagger';
import { AsociarDocumentoAvanceDto } from './dto/asociar-documento-avance.dto';

@ApiTags('Avance Fisico')
@Controller('avance_fisico')
export class AvanceFisicoController {
  constructor(private readonly avanceFisicoService: AvanceFisicoService) {}

  // @Post()
  // create(@Body() createAvanceFisicoDto: CreateAvanceFisicoDto) {
  //   return this.avanceFisicoService.create(createAvanceFisicoDto);
  // }

  @Post()

  create(@Body() dto: CreateAvanceFisicoDto) {
    return this.avanceFisicoService.crearAvance(dto);
  }

  @Get()
  findAll() {
    return this.avanceFisicoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.avanceFisicoService.findOne(+id);
  }

  @Get('obra/:id/actual')
  findActual(@Param('id') id: string) {
    return this.avanceFisicoService.findActual(+id);
  }

  @Get('obra/:id/historial')
  findHistorial(@Param('id') id: string) {
    return this.avanceFisicoService.findHistorial(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAvanceFisicoDto) {
    return this.avanceFisicoService.actualizarAvance(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.avanceFisicoService.remove(+id);
  }

  @Post('documentos/:id')
  asociarDocumento(
    @Param('id') id: string,
    @Body() dto: AsociarDocumentoAvanceDto,
  ) {
    return this.avanceFisicoService.asociarDocumento(+id, dto);
  }

  //   // Controller
  // @Get(':id/documentos')
  // listarDocs(@Param('id') id: string) {
  //   return this.avanceFisicoService.listarDocumentosDeAvance(+id);
  // }

  @Delete(':id/documentos/:idDoc')
  desasociarDoc(@Param('id') id: string, @Param('idDoc') idDoc: string) {
    return this.avanceFisicoService.detachDocumento(+id, +idDoc);
  }

// @Get('documento/:id_avance_fisico')
// getDocumento(
//   @Param('id') id: string,
//   // @Query('id_documento') id_documento?: string,
//   @Query('id_tipo_documento') id_tipo_documento?: string,
// ) {
//   const opts = {
//     //id_documento: id_documento ? Number(id_documento) : undefined,
//     id_tipo_documento: id_tipo_documento ? Number(id_tipo_documento) : undefined,
//   };
//   return this.avanceFisicoService.getDocumentoDeAvance(+id, opts);
// }

@Get('documento/:id_avance_fisico')
getUltimoDocumento(@Param('id_avance_fisico') id: string) {
  return this.avanceFisicoService.getDocumentosDeAvance(+id); // sin filtros
}


}
