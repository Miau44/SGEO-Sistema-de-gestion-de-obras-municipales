import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Query, HttpException, HttpStatus, UploadedFiles } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListaDocumentoDto } from './dto/listaDocumento.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import multer from 'multer';
import path from 'path';
import { Documento } from './entities/documento.entity';
import { DocumentoObraDto } from './dto/documento_obra.dto';

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
  @UseInterceptors(FilesInterceptor('files', 10, { storage: multer.memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        id_obra: { type: 'number' },
        id_tipo_documento: { type: 'number' },
        id_usuario_registro: { type: 'number' },
        ciNitFuncionario: { type: 'string' },
        usuario_desc: { type: 'string' },
      },
    },
  })
  async uploadMultipleDocumentosSICOM(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('id_obra') id_obra: number,
    @Body('id_tipo_documento') id_tipo_documento: number,
    @Body('id_usuario_registro') id_usuario_registro: number,
    @Body('ciNitFuncionario') ciNitFuncionario: string,
    @Body('usuario_desc') usuario_desc: string
  ): Promise<{ documentos: { id_documento: number; url_file: string }[] }> {
    if (!files || files.length === 0) {
      throw new HttpException('No se han cargado archivos', HttpStatus.BAD_REQUEST);
    }

    const resultados = [];
    
    for (const file of files) {
      const fileExtension = path.extname(file.originalname).slice(1);

      // Genera la ruta inicial para el documento
      const ruta = await this.documentoService.generateDocumentRoute(
        id_obra,
        id_tipo_documento,
        id_usuario_registro,
        ciNitFuncionario,
        usuario_desc
      );

      // Crea el documento en la base de datos con la ruta inicial
      const nuevoDocumento = new Documento();
      nuevoDocumento.id_obra = id_obra;
      nuevoDocumento.id_tipo_documento = id_tipo_documento;
      nuevoDocumento.usuario_registro = id_usuario_registro;
      nuevoDocumento.ruta_documento = ruta;
      nuevoDocumento.cumple = false;

      const savedDocumento = await this.documentoService.createDocumento(nuevoDocumento);

      // Subir el archivo al servicio externo
      const uploadResponse = await this.documentoService.uploadFileToExternalService(
        file,
        ruta,
        'marvel',
        'marvel123',
        'rita.flores'
      );

      if (uploadResponse.estado && uploadResponse.url_file) {
        // Actualiza la URL del archivo en la base de datos
        await this.documentoService.saveDocumentoUrl(savedDocumento.id_documento, uploadResponse.url_file);
        resultados.push({
          id_documento: savedDocumento.id_documento,
          url_file: uploadResponse.url_file,
        });
      } else {
        throw new HttpException(
          `Error en el servicio externo para el archivo ${file.originalname}`,
          HttpStatus.BAD_GATEWAY
        );
      }
    }

    // Retorna los resultados acumulados
    return { documentos: resultados };
  }

 //modificar esto este servicio que LISTA DPCUMENTOS (SEGUIMIENTO OBRAS) ya que esta mal, pero funcional
 @Post('pdf-por-obra')
 @ApiBody({
   schema: {
     type: 'object',
     properties: {
       id_obra: { type: 'number', example: 1131 }
     },
   },
 })
 async obtenerDocsPdf(@Body() body: any): Promise<any[]> {
   const { id_obra } = body;
   return this.documentoService.obtenerDocsPdfxObra(id_obra);
 }

  @Public()
  @Post('listar')
    documentosXObra(@Body() documentoDto: DocumentoObraDto) {
      try {  
        return this.documentoService.documentosXObra(documentoDto);
      } catch (error) {
      }
  } 

  @Public()
  @Post('lista-documentos')
    listaPersonas(@Body() documentoDto: ListaDocumentoDto) {
      try {  
        return this.documentoService.listaDocumentos(documentoDto);
      } catch (error) {
      }
  }

  @Public()
  @Post('lista-documentos-adjuntos')
    listaDocumentos(@Body() documentoDto: ListaDocumentoDto) {
      try {  
        return this.documentoService.listaDocumentosXObraConAdjunto(documentoDto);
      } catch (error) {
      }
  }
}
