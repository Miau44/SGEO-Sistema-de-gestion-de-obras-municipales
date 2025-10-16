import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProtocoloModificacionService } from './protocolo_modificacion.service';
import { CreateProtocoloModificacionDto } from './dto/create-protocolo_modificacion.dto';
import { UpdateProtocoloModificacionDto } from './dto/update-protocolo_modificacion.dto';

@Controller('protocolo-modificacion')
export class ProtocoloModificacionController {
  constructor(private readonly protocoloModificacionService: ProtocoloModificacionService) {}

  @Post()
  create(@Body() createProtocoloModificacionDto: CreateProtocoloModificacionDto) {
    return this.protocoloModificacionService.create(createProtocoloModificacionDto);
  }

  @Get()
  findAll() {
    return this.protocoloModificacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.protocoloModificacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProtocoloModificacionDto: UpdateProtocoloModificacionDto) {
    return this.protocoloModificacionService.update(+id, updateProtocoloModificacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.protocoloModificacionService.remove(+id);
  }
}
