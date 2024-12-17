import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Query, HttpException, HttpStatus } from '@nestjs/common';
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
@UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary' },
      id_obra: { type: 'number' },
      id_tipo_documento: { type: 'number' },
      id_usuario_registro: { type: 'number' },
      ciNitFuncionario: { type: 'string' },
    },
  },
})
async uploadDocumentoSICOM(
  @UploadedFile() file: Express.Multer.File,
  @Body('id_obra') id_obra: number,
  @Body('id_tipo_documento') id_tipo_documento: number,
  @Body('id_usuario_registro') id_usuario_registro: number,
  @Body('ciNitFuncionario') ciNitFuncionario: string
): Promise<{ url_file: string; id_documento: number }> {
  const fileExtension = path.extname(file.originalname).slice(1);

  // Genera la ruta inicial para el documento
  const ruta = await this.documentoService.generateDocumentRoute(
    id_obra,
    id_tipo_documento,
    id_usuario_registro,
    fileExtension,
    ciNitFuncionario
  );

  // Crea el documento en la base de datos con la ruta inicial
  const nuevoDocumento = new Documento();
  nuevoDocumento.id_obra = id_obra;
  nuevoDocumento.id_tipo_documento = id_tipo_documento;
  nuevoDocumento.usuario_registro = id_usuario_registro;
  nuevoDocumento.ruta_documento = ruta; // Ruta inicial generada
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

  // Verificar la respuesta del servicio externo
  if (uploadResponse.estado && uploadResponse.url_file) {
    // Actualiza la URL del archivo en la base de datos
    await this.documentoService.saveDocumentoUrl(savedDocumento.id_documento, uploadResponse.url_file);
  } else {
    throw new HttpException(
      'Error en la respuesta del servicio externo',
      HttpStatus.BAD_GATEWAY
    );
  }

  // Retorna tanto el `url_file` como el `id_documento`
  return {
    url_file: uploadResponse.url_file,
    id_documento: savedDocumento.id_documento,
  };
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
