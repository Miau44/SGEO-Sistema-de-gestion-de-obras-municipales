import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParametricaService } from './parametrica.service';
import { CreateParametricaDto } from './dto/create-parametrica.dto';
import { UpdateParametricaDto } from './dto/update-parametrica.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('parametrica')
@Controller('parametrica')
export class ParametricaController {
  constructor(private readonly parametricaService: ParametricaService) {}

  @Post()
  create(@Body() createParametricaDto: CreateParametricaDto) {
    return this.parametricaService.create(createParametricaDto);
  }

  @Get()
  findAll() {
    return this.parametricaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parametricaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParametricaDto: UpdateParametricaDto) {
    return this.parametricaService.update(+id, updateParametricaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parametricaService.remove(+id);
  }
}
