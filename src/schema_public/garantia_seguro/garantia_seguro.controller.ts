import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GarantiaSeguroService } from './garantia_seguro.service';
import { CreateGarantiaSeguroDto } from './dto/create-garantia_seguro.dto';
import { UpdateGarantiaSeguroDto } from './dto/update-garantia_seguro.dto';

@Controller('garantia-seguro')
export class GarantiaSeguroController {
  constructor(private readonly garantiaSeguroService: GarantiaSeguroService) {}

  @Post()
  create(@Body() createGarantiaSeguroDto: CreateGarantiaSeguroDto) {
    return this.garantiaSeguroService.create(createGarantiaSeguroDto);
  }

  @Get()
  findAll() {
    return this.garantiaSeguroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.garantiaSeguroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGarantiaSeguroDto: UpdateGarantiaSeguroDto) {
    return this.garantiaSeguroService.update(+id, updateGarantiaSeguroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.garantiaSeguroService.remove(+id);
  }
}
