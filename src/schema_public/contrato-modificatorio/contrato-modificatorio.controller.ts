import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ContratoModificatorioService } from './contrato-modificatorio.service';
import { ContratoModificatorio } from './entities/contrato-modificatorio.entity';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateContratoModificatorioDto } from './dto/create-contrato-modificatorio.dto';

@ApiTags('Contrato Modificatorio')
@Controller('contrato-modificatorio')
export class ContratoModificatorioController {
  constructor(private readonly contratoService: ContratoModificatorioService) {}

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

  @Post()
  //@UseGuards(AuthGuard('jwt'))  // Descomenta esta línea si deseas usar autenticación JWT
  @ApiOperation({ summary: 'Crear un nuevo contrato modificatorio' })
  @ApiResponse({ status: 201, description: 'Contrato creado con éxito.' })
  create(@Body() createContratoModificatorioDto:CreateContratoModificatorioDto) {
    return this.contratoService.create(createContratoModificatorioDto);
  }

  // @Put(':id')
  // update(@Param('id') id: number, @Body() data: Partial<ContratoModificatorio>) {
  //   return this.contratoService.update(id, data);
  // }

  // @Delete(':id')
  // delete(@Param('id') id: number) {
  //   return this.contratoService.delete(id);
  // }
}