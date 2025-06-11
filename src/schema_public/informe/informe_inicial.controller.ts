import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, InternalServerErrorException, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { InformeService } from './informe_inicial.service';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { ResponseService } from 'src/response.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ListaInformeDto } from './dto/lista-informe.dto';
import { CreateInformeInicialDto } from './dto/create-informe-inicial.dto';
import { UpdateInformeInicialDto } from './dto/update-informe-inicial.dto';
import { InformeObraDto } from './dto/informe-obra.dto';
import { InformeOpcionDto } from './dto/informe-opcion.dto';
import { InformeActividadesDto } from './dto/informe-actividades.dto';
import { DocumentoService } from '../documento/documento.service';


@ApiTags('informe')
@Controller('informe')
export class InformeController {
  constructor(
    private readonly informeService: InformeService,
  ) { }

  @Public()
  @Post()
  async create(@Body() createInformeDto: CreateInformeDto) {
      return this.informeService.create(createInformeDto);
  }

  @Public()
  @Get()
  findAll() {
    try {
      return this.informeService.findAll();
    } catch (error) { }

  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    try {    
    return this.informeService.findOne(+id);
  } catch (error) { }    
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInformeDto: UpdateInformeDto) {
    try {
      return this.informeService.update(+id, updateInformeDto);
    } catch (error) {
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informeService.remove(+id);
  }


  @Public()
    @Post('lista-informe-inicial')
    listaInformeInicial(@Body() informeDto: ListaInformeDto) {
      try {  
        return this.informeService.listaInformeInicial(informeDto);
      } catch (error) {
      }
    } 
    
    
    @Public()
    @Post('informe-inicial')
    createInformeIncial(@Body() createInfInformeDto: CreateInformeInicialDto) {
      try {
        return this.informeService.createInformeInicial(createInfInformeDto);
      } catch (error) { }
    }

  @Public()
  @Patch('informe-inicial/:id')
  updateInformeInicial(@Param('id') id: string, @Body() updateInformeInicialDto: UpdateInformeInicialDto) {
    try {
      return this.informeService.updateInformeInicial(+id, updateInformeInicialDto);
    } catch (error) {
    }
  }


  /*@Public()
  @Post('si-existe-informe')
  async siExisteInforme(@Body() data: InformeObraDto): Promise<boolean> {
    return this.informeService.siExisteInforme(data);
  }    */


  @Public()
  @Post('si-existe-informe')
  siExisteInforme(@Body() data: InformeObraDto) {
    try {
      return this.informeService.siExisteInforme(data);
    } catch (error) { }
  }

  @Public()
  @Post('informe-opcion')
  listaOpcionesInforme(@Body() opcionInformeDto: InformeOpcionDto) {
    try {
      return this.informeService.listaOpcionesInforme(opcionInformeDto);
    } catch (error) { }
  }

  @Public()
  @Post('lista-informe-actividades')
  listaInformeActividades(@Body() informeDto: InformeActividadesDto) {
    try {  
      return this.informeService.listaInformeActividades(informeDto);
    } catch (error) {
    }
  } 

  @Public()
  @Post('lista-emitir-orden')
  listaEmitirOrder() {
    try {  
      return this.informeService.listaEmitirOrden();
    } catch (error) {
    }
  }  
  
  @Public()
  @Post('lista-informe-obra')
  listaInformeObra(@Body() informeDto: InformeObraDto) {
    try {  
      return this.informeService.listaInformeObra(informeDto);
    } catch (error) {
    }
  } 


  
  // Para hacer registros de los documentos de un informe
  
  @Post('updateDocumentosInforme')
  @ApiBody({
      schema: {
          type: 'object',
          properties: {
              id_informe: { type: 'number', example: 1 },
              id_documentos: {
                  type: 'array',
                  items: { type: 'number' },
                  example: [197, 198, 199],
              },
          },
          required: ['id_informe', 'id_documentos'],
      },
  })
  async updateInformeDocumentos(
      @Body('id_informe') id_informe: number,
      @Body('id_documentos') id_documentos: number[]
  ): Promise<{ message: string; id_informe: number; documentos: { id_documento: number }[] }> {
      if (!id_informe || !id_documentos || id_documentos.length === 0) {
          throw new HttpException(
              'El id_informe y id_documentos son requeridos.',
              HttpStatus.BAD_REQUEST
          );
      }
  
      const result = await this.informeService.updateInformeDocumentos(id_informe, id_documentos);
      return result;
  }

  /**
   * obtendra los datos que tiene el informe
   */
  @Get(':idSolicitud/:idModificacion/:idTipoInforme')
  async obtenerFormulario(
    @Param('idSolicitud') idSolicitud: number,
    @Param('idModificacion') idModificacion: number,
    @Param('idTipoInforme') idTipoInforme: number,
  ) {
    return this.informeService.obtenerDatosFormulario(idSolicitud, idModificacion, idTipoInforme);
  }

  /**
   * actualizara el formulario 
   */
  @Patch(':idModificacion/:idInforme')
  async actualizarFormulario(
    @Param('idModificacion') idModificacion: number,
    @Param('idInforme') idInforme: number,
    @Body() datosFormulario: any
  ) {
    return this.informeService.actualizarFormulario(idModificacion, idInforme, datosFormulario);
  }

    /**
   * actualizara fecha de informe formulario para la aprobacion, abl, 11/06/2025
   */
  //modificar el servicio a post, con el parametro idInforme
  @Public()
  @Post('aprobarInforme/:idInforme')
  async AprobarInforme(
    @Param('idInforme') idInforme: number
  ) {
    return this.informeService.aprobarInforme(idInforme);
  }
}
