import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProtocoloService } from './protocolo.service';
import { CreateProtocoloDto } from './dto/create-protocolo.dto';
import { UpdateProtocoloDto } from './dto/update-protocolo.dto';

@Controller('protocolo')
export class ProtocoloController {
  constructor(private readonly protocoloService: ProtocoloService) {}

  @Post()
  create(@Body() createProtocoloDto: CreateProtocoloDto) {
    return this.protocoloService.create(createProtocoloDto);
  }

  @Get()
  findAll() {
    return this.protocoloService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.protocoloService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProtocoloDto: UpdateProtocoloDto) {
    return this.protocoloService.update(+id, updateProtocoloDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.protocoloService.remove(+id);
  }
}
