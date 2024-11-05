import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListaDocumentoDto } from './dto/listaDocumento.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import multer from 'multer';
import path from 'path';
import { Documento } from './entities/documento.entity';

@ApiTags('documentos')

@Controller('documento')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  @Public()  
  @Post()
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    try {
    return this.documentoService.create(createDocumentoDto);
  } catch (error) {
    }       
  }


  @Post('uploadSICOM')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        id_obra: { type: 'number' },
        id_tipo_documento: { type: 'number' },
        usuario_registro: { type: 'number' },
      },
    },
  })
  async uploadDocumentoSICOM(
    @UploadedFile() file: Express.Multer.File,
    @Body('id_obra') id_obra: number,
    @Body('id_tipo_documento') id_tipo_documento: number,
    @Body('usuario_registro') usuario_registro: number
  ): Promise<{ url_file: string; id_documento: number }> {
    const fileExtension = path.extname(file.originalname).slice(1);

    const ruta = await this.documentoService.generateDocumentRoute(id_obra, id_tipo_documento, usuario_registro, fileExtension);

    const nuevoDocumento = new Documento();
    nuevoDocumento.id_obra = id_obra;
    nuevoDocumento.id_tipo_documento = id_tipo_documento;
    nuevoDocumento.usuario_registro = usuario_registro;
    nuevoDocumento.ruta_documento = ruta;
    nuevoDocumento.cumple = false;

    const savedDocumento = await this.documentoService.createDocumento(nuevoDocumento);

    const uploadResponse = await this.documentoService.uploadFileToExternalService(
      file,
      ruta,
      "marvel",
      "marvel123",
      "rita.flores"
    );

    if (uploadResponse.estado && uploadResponse.url_file) {
      await this.documentoService.saveDocumentoUrl(savedDocumento.id_documento, uploadResponse.url_file);
    }

    return {
      url_file: uploadResponse.url_file,
      id_documento: savedDocumento.id_documento,
    };
  }


  @Public()
  @Get('listar/:id_obra')
  @ApiOperation({ summary: ' id_obra:1' })
  rechazarDesignacion(@Param('id_obra') id_obra: number) {
    return this.documentoService.documentosXObra(+id_obra);
  }  

  @Public()
    @Post('lista-documentos')
    listaPersonas(@Body() documentoDto: ListaDocumentoDto) {
      try {  
        return this.documentoService.listaDocumentos(documentoDto);
      } catch (error) {
      }
    }

}
