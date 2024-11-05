import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Empresa } from './entities/empresa.entity';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Empresa')
@Controller('empresa')
export class EmpresaController {
  
  constructor(private readonly empresaService: EmpresaService) {}

  @Post()
  async create(@Body() createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    return await this.empresaService.create(createEmpresaDto);
  }

  @Get()
  async findAll(): Promise<Empresa[]> {
    return await this.empresaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Empresa> {
    return await this.empresaService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateEmpresaDto })
  async update(@Param('id') id: number, @Body() updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
    return await this.empresaService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return await this.empresaService.remove(id);
  }
}
