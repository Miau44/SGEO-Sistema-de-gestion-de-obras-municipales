import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ContratoModificatorioService } from './contrato-modificatorio.service';
import { ContratoModificatorio } from './entities/contrato-modificatorio.entity';

@Controller('contrato-modificatorio')
export class ContratoModificatorioController {
  constructor(private contratoService: ContratoModificatorioService) {}

  @Get()
  findAll() {
    return this.contratoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.contratoService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<ContratoModificatorio>) {
    return this.contratoService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<ContratoModificatorio>) {
    return this.contratoService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.contratoService.delete(id);
  }
}