import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstructuraOrganizacionalService } from './estructura_organizacional.service';
import { CreateEstructuraOrganizacionalDto } from './dto/create-estructura_organizacional.dto';
import { UpdateEstructuraOrganizacionalDto } from './dto/update-estructura_organizacional.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { EstructuraDADto } from './dto/estructura-da.dto';


@ApiTags('estructura-organizacional')
@Controller('estructura-organizacional')
export class EstructuraOrganizacionalController {
  constructor(private readonly estructuraOrganizacionalService: EstructuraOrganizacionalService) {}

  @Post()
  create(@Body() createEstructuraOrganizacionalDto: CreateEstructuraOrganizacionalDto) {
    return this.estructuraOrganizacionalService.create(createEstructuraOrganizacionalDto);
  }

  @Public()
  @Get(':gestion')
  findAll(@Param('gestion') gestion: number) {
    try {
    return this.estructuraOrganizacionalService.findAll(gestion);
  } catch (error) {
  }    
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estructuraOrganizacionalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstructuraOrganizacionalDto: UpdateEstructuraOrganizacionalDto) {
    return this.estructuraOrganizacionalService.update(+id, updateEstructuraOrganizacionalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estructuraOrganizacionalService.remove(+id);
  }

  @Public()
  @Post('estructura-da')
  async estructuraDa(@Body() estructuraDa: EstructuraDADto) {
    try {
      return this.estructuraOrganizacionalService.estructuraDa(estructuraDa);
    } catch (error) {
    }
  }  

  @Public()
  @Post('CardadoUes')
  async llenarBase(@Body() estructuraDa?: EstructuraDADto): Promise<string> {
    await this.estructuraOrganizacionalService.llenarUEDesdeServicio();
    return 'Proceso de llenado completado.';
  }

  @Post('cargadoPuesto')
  @Public()
  @ApiOperation({ summary: 'cargado de fichas e items' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        gestion: { type: 'number', example: 2025 },
        codigoue: { type: 'string', example: 263 },
      },
      required: ['gestion', 'codigoue'],
    },
  })
  async cargadoPuesto(@Body() body: { gestion: number, codigoue: string }) { //añadir parametro de entrada a servicio test, gestion
    //validar que el id_usuario no sea nulo
    if (body == null) {
      console.error('Error: id_usuario es nulo');
      return { message: 'error', error: 'id_usuario es nulo' };
    }
    const { gestion, codigoue } = body;
    //validar que la gestion no sea nulo y mayor a 2020
    if (gestion == null && gestion > 2020) {
      console.error('Error: gestion es nulo');
      return { message: 'error', error: 'gestion es nulo' };
    }
    //const token = await this.ficha_itemService.obtenerToken();
    console.log("gestion", gestion);
    
    return await this.estructuraOrganizacionalService.cargadoPuesto(gestion, codigoue);
  }
}
