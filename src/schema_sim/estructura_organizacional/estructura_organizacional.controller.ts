import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstructuraOrganizacionalService } from './estructura_organizacional.service';
import { CreateEstructuraOrganizacionalDto } from './dto/create-estructura_organizacional.dto';
import { UpdateEstructuraOrganizacionalDto } from './dto/update-estructura_organizacional.dto';
import { ApiTags } from '@nestjs/swagger';
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
}
