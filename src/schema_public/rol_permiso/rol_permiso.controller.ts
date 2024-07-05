import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolPermisoService } from './rol_permiso.service';
import { CreateRolPermisoDto } from './dto/create-rol_permiso.dto';
import { UpdateRolPermisoDto } from './dto/update-rol_permiso.dto';

@Controller('rol-permiso')
export class RolPermisoController {
  constructor(private readonly rolPermisoService: RolPermisoService) {}

  @Post()
  create(@Body() createRolPermisoDto: CreateRolPermisoDto) {
    return this.rolPermisoService.create(createRolPermisoDto);
  }

  @Get()
  findAll() {
    return this.rolPermisoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolPermisoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRolPermisoDto: UpdateRolPermisoDto) {
    return this.rolPermisoService.update(+id, updateRolPermisoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolPermisoService.remove(+id);
  }
}
