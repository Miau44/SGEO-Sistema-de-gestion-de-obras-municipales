import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentoSistemaService } from './documento_sistema.service';
import { CreateDocumentoSistemaDto } from './dto/create-documento_sistema.dto';
import { UpdateDocumentoSistemaDto } from './dto/update-documento_sistema.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Documento Sistema')
@Controller('documento_sistema')
export class DocumentoSistemaController {
  constructor(private readonly documentoSistemaService: DocumentoSistemaService) {}

  @Post()
  create(@Body() createDocumentoSistemaDto: CreateDocumentoSistemaDto) {
    return this.documentoSistemaService.create(createDocumentoSistemaDto);
  }

  @Get()
  findAll() {
    return this.documentoSistemaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentoSistemaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentoSistemaDto: UpdateDocumentoSistemaDto) {
    return this.documentoSistemaService.update(+id, updateDocumentoSistemaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentoSistemaService.remove(+id);
  }

  @Get('listar/:idObra')
  async listarPorObra(@Param('idObra') idObra: number) {
    const data = await this.documentoSistemaService.listarDocumentosPorObra(idObra);
    return {
      success: true,
      total: data.length,
      data
    };
  }
}
