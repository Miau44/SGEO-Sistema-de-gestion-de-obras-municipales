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
    } catch (error) {}
  }

  @Post('uploadSICOM')
  @UseInterceptors(
    FilesInterceptor('files', 10, { storage: multer.memoryStorage() }),
  )
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
    @Body('usuario_desc') usuario_desc: string,
  ): Promise<{ documentos: { id_documento: number; url_file: string }[] }> {
    if (!files || files.length === 0) {
      throw new HttpException(
        'No se han cargado archivos',
        HttpStatus.BAD_REQUEST,
      );
    }

    const resultados = [];

    for (const file of files) {
      const ruta = await this.documentoService.generateDocumentRoute(
        id_obra,
        id_tipo_documento,
        id_usuario_registro,
        ciNitFuncionario,
        usuario_desc,
      );

      const nuevoDocumento = new Documento();
      nuevoDocumento.id_obra = id_obra;
      nuevoDocumento.id_tipo_documento = id_tipo_documento;
      nuevoDocumento.usuario_registro = id_usuario_registro;
      nuevoDocumento.ruta_documento = '';
      nuevoDocumento.cumple = true;
      nuevoDocumento.nombre_documento = this.documentoService.normalizeFileName(
        file.originalname,
      );

      const savedDocumento =
        await this.documentoService.createDocumento(nuevoDocumento);

      const uploadResponse =
        await this.documentoService.uploadFileToExternalService(
          file,
          ruta,
          `archivo asociado al documento con id ${id_tipo_documento}`,
          `documento-${id_tipo_documento}`,
          'josue.torrez',
        );

      console.log('1: ', uploadResponse);

      if (uploadResponse.estado && uploadResponse.url_file) {
        console.log('entras al if_:');

        await this.documentoService.saveDocumentoUrl(
          savedDocumento.id_documento,
          uploadResponse.url_file,
        );
        resultados.push({
          id_documento: savedDocumento.id_documento,
          nombre_documento: nuevoDocumento.nombre_documento,
          url_file: uploadResponse.url_file,
          uploadUrl: uploadResponse.uploadUrl,
          ruta: uploadResponse.ruta,
          resumen: uploadResponse.resumen,
          palabraClave: uploadResponse.palabraClave,
        });
      } else {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_GATEWAY,
            message: uploadResponse,
            error: 'Error al subir archivo',
          },
          HttpStatus.BAD_GATEWAY,
        );
      }
    }

    return { documentos: resultados };
  }

  @Get('informe/:id')
  async obtenerDocumentos(@Param('id') idInforme: number) {
    return this.documentoService.obtenerDocumentosPorInforme(idInforme);
  }

  //modificar esto este servicio que LISTA DPCUMENTOS (SEGUIMIENTO OBRAS) ya que esta mal, pero funcional
  @Post('pdf-por-obra')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id_obra: { type: 'number', example: 1131 },
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
    } catch (error) {}
  }

  @Public()
  @Post('lista-documentos')
  listaPersonas(@Body() documentoDto: ListaDocumentoDto) {
    try {
      return this.documentoService.listaDocumentos(documentoDto);
    } catch (error) {}
  }

  @Patch('cambiar-estado')
  cambiarEstado(@Body() data: { id_documento: number; id_estado: number }) {
    return this.documentoService.update(data.id_documento, {
      id_estado: data.id_estado,
    });
  }

  @Public()
  @Post('lista-documentos-adjuntos')
  listaDocumentos(@Body() documentoDto: ListaDocumentoDto) {
    try {
      return this.documentoService.listaDocumentosXObraConAdjunto(documentoDto);
    } catch (error) {}
  }

  /****************************************************************************************
   **************************Generacion de documentos hacia atras**************************/

  @Get('infObra-sin-documento')
  async obtenerInformesObraSinDocumento() {
    return this.documentoService.listarInformesDeObraPendientesDeDocumento();
  }

  @Get('infoInicial-sin-documento')
  async listarInformesInicialesSinDocumento() {
    return this.documentoService.listarInformesInicialesSinDocumento();
  }

  @Get('infoActividadesPrevias-sin-documento')
  async listarInformesPreviosSinDocumento() {
    return this.documentoService.listarInformesPreviosSinDocumento();
  }

  @Get('infoPrevisionPagos-sin-documento')
async listarInformesPrevisionPagosSinDocumento() {
  return this.documentoService.listarInformesPrevisionPagosSinDocumento();
}

}
