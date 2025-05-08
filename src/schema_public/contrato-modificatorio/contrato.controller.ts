import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ContratoService } from './contrato.service';
import { Contrato } from './entities/contrato.entity';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @Post('cargarContratosDlc/:gestion')
  @ApiParam({ name: 'gestion', description: 'gestión requerida' })
  async llenarContratos(@Param('gestion') gestion: number): Promise<any> {
    try {
      const r = await this.contratoService.obtenerToken();
      return await this.contratoService.llenarContratosDesdeServicio(gestion);
    } catch (error) {
      console.error('Error:', error);
      return 'Test error';
    }
  }

  @Public()
  @Post('cargarUrlContratosDlc/:gestion')
  @ApiParam({ name: 'gestion', description: 'gestión requerida' })
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
}