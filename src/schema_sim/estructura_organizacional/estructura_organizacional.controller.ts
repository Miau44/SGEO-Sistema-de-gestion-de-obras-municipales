import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstructuraOrganizacionalService } from './estructura_organizacional.service';
import { CreateEstructuraOrganizacionalDto } from './dto/create-estructura_organizacional.dto';
import { UpdateEstructuraOrganizacionalDto } from './dto/update-estructura_organizacional.dto';

@Controller('estructura-organizacional')
export class EstructuraOrganizacionalController {
  constructor(private readonly estructuraOrganizacionalService: EstructuraOrganizacionalService) {}

  @Post()
  create(@Body() createEstructuraOrganizacionalDto: CreateEstructuraOrganizacionalDto) {
    return this.estructuraOrganizacionalService.create(createEstructuraOrganizacionalDto);
  }

  @Get()
  findAll() {
    return this.estructuraOrganizacionalService.findAll();
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
}
