import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ContratoService } from './contrato.service';
import { Contrato } from './entities/contrato.entity';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { ContratoDlcDto } from './dto/contrato-dlc.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Contrato')
@Controller('contrato')
export class ContratoController {
  constructor(private readonly contratoService: ContratoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los contratos modificatorios' })
  @ApiResponse({ status: 200, description: 'Listado de contratos obtenidos con éxito.' })
  findAll() {
    return this.contratoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un contrato modificatorio por ID' })
  @ApiParam({ name: 'id', description: 'ID del contrato' })
  @ApiResponse({ status: 200, description: 'Contrato obtenido con éxito.' })
  findOne(@Param('id') id: number) {
    return this.contratoService.findOne(id);
  }

  // @Post()
  // //@UseGuards(AuthGuard('jwt'))  // Descomenta esta línea si deseas usar autenticación JWT
  // @ApiOperation({ summary: 'Crear un nuevo contrato modificatorio' })
  // @ApiResponse({ status: 201, description: 'Contrato creado con éxito.' })
  // create(@Body() createContratoModificatorioDto:CreateContratoModificatorioDto) {
  //   return this.contratoService.create(createContratoModificatorioDto);
  // }

   @Post()
  // //@UseGuards(AuthGuard('jwt'))  // Descomenta esta línea si deseas usar autenticación JWT
  @ApiOperation({ summary: 'registrar_contrato un nuevo contrato modificatorio' })
   @ApiResponse({ status: 201, description: 'registrar_contrato Contrato creado con éxito.' })
   registrar_contrato(@Body() contratoDlc:ContratoDlcDto) {
     return this.contratoService.registrar_contrato_modificatorio(contratoDlc);
   }

  // @Post()
  // //@UseGuards(AuthGuard('jwt'))  // Descomenta esta línea si deseas usar autenticación JWT
  // @ApiOperation({ summary: 'Crear un nuevo contrato modificatorio' })
  // //@ApiResponse({ status: 201, description: 'Contrato creado con éxito.' })
  // registrar_contrato(@Body() createContratoModificatorioDto:CreateContratoModificatorioDto) {
  //   return 0;
  // }
  // @Put(':id')
  // update(@Param('id') id: number, @Body() data: Partial<ContratoModificatorio>) {
  //   return this.contratoService.update(id, data);
  // }

  // @Delete(':id')
  // delete(@Param('id') id: number) {
  //   return this.contratoService.delete(id);
  // }

  
@Public()
@Post('cargarContratosDlc/:gestion/:id_usuario')
@ApiParam({ name: 'gestion', description: 'Gestión requerida' })
@ApiParam({ name: 'id_usuario', description: 'ID del usuario que realiza la carga' })
async cargarContratosDlc(
  @Param('gestion') gestion: number,
  @Param('id_usuario') id_usuario: number,
): Promise<any> {
  try {
    console.log('🟢 Iniciando carga de contratos desde servicio DLC...');
    console.log('Gestión:', gestion, '| Usuario:', id_usuario);

    if (!id_usuario) {
      return { status: 'error', message: 'id_usuario es indefinido' };
    }

    await this.contratoService.obtenerToken();

    const resultado = await this.contratoService.llenarContratosDesdeServicio(gestion, id_usuario);

    return {
      status: 'ok',
      message: 'Proceso completado correctamente',
      resumen: resultado,
    };
  } catch (error) {
    console.error('❌ Error al cargar contratos:', error);
    return { status: 'error', message: (error as any).message };
  }
}

  
@Public()
@Post('cargarContratosDlcNuevo/:gestion/:id_usuario/:codcarpeta')
@ApiParam({ name: 'gestion', description: 'Gestión requerida' })
@ApiParam({ name: 'id_usuario', description: 'ID del usuario que realiza la carga' })
@ApiParam({ name: 'codcarpeta', description: 'Código de carpeta' })
async cargarContratosDlcNuevo(
  @Param('gestion') gestion: number,
  @Param('id_usuario') id_usuario: number,
  @Param('codcarpeta') codcarpeta: number
): Promise<any> {
  try {
    await this.contratoService.obtenerToken();

    const result = await this.contratoService.llenarContratosDesdeServicioPorCodCarpeta(
      gestion,
      id_usuario,
      codcarpeta
    );

    return { message: 'Proceso completado', result };
  } catch (error) {
    console.error('Error:', error);
    return { message: 'error', error: (error as any).message };
  }
}


///token
  @Public()
  @Post('cargarUrlContratosDlc/:gestion')
  @ApiParam({ name: 'gestion', description: 'gestión requerida' })
  @UseGuards(AuthGuard('jwt'))
  async llenarUrlContratos(@Param('gestion') gestion: number): Promise<any> {
    try {
      const gestionNumber = Number(gestion);
      const r = await this.contratoService.obtenerToken();
      return await this.contratoService.actualizarUrlContratosDesdeServicio(gestionNumber);
    } catch (error) {
      console.error('Error:', error);
      return 'Test error';
    }
  }

  //generar una funcion a partir del dto contrato-dlc.dto.ts
  @Public()
  @Post('RegistrarContratoSicom')
  @ApiBody({ type: ContratoDlcDto })
  @UseGuards(AuthGuard('jwt'))
  async RegistrarContratoSicom(@Body() contratoDlc: ContratoDlcDto): Promise<any> {
    try {
      const r = await this.contratoService.obtenerToken();
      return await this.contratoService.registrar_contrato_modificatorio(contratoDlc);
    } catch (error) {
      console.error('Error:', error);
      return 'Test error';
    }
  }

  //controlador para resolucion de contrato se  añadio token 13/05
  @Post('resolver/:idContratoDlc')
  @UseGuards(AuthGuard('jwt'))
  async resolverContrato(@Param('idContratoDlc') idContratoDlc: string) {

    console.log('Entró resolverContrato');

    try{

      console.log ('inicio de  rosolucion contrato', idContratoDlc);
      const respuesta = await this.contratoService.resolucionContrato(
        Number(idContratoDlc),
      );
      console.log('OK resolución contrato:', respuesta);

      return respuesta;
    }catch (error){
      console.log('error resolucion contrato', error)
      throw error;
    }
    //return this.contratoService.resolucionContrato(Number(idContratoDlc));
  }

  @Post('consultarContrato')
  @Public()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        correlativo_carpeta: { type: 'number', example: 363321 },
        gestion: { type: 'number', example: 2025 },
      },
      required: ['correlativo_carpeta'],
    },
  })
  @ApiOperation({ summary: 'cargado de fichas e items' })
  async consultarContrato(@Body() body: { correlativo_carpeta: number,gestion:number }) { //añadir parametro de entrada a servicio test, gestion
    //validar que el id_usuario no sea nulo
    if (body == null) {
      console.error('Error: id_usuario es nulo');
      return { message: 'error', error: 'id_usuario es nulo' };
    }
    const { correlativo_carpeta,gestion } = body;
    //validar que la gestion no sea nulo y mayor a 2020
    if (correlativo_carpeta == null) {
      console.error('Error: gestion es nulo');
      return { message: 'error', error: 'gestion es nulo' };
    }

    try {
      const token = await this.contratoService.obtenerToken();
      const result = await this.contratoService.consultarContrato(correlativo_carpeta,gestion);
      return {result};
    } catch (error) {
      console.error('Error:', error);
      return { message: 'Test error', error: error || error };
    }
  }
}