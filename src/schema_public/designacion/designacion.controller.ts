import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DesignacionService } from './designacion.service';
import { CreateDesignacionDto } from './dto/create-designacion.dto';
import { UpdateDesignacionDto } from './dto/update-designacion.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';


@ApiTags('designacion')
@Controller('designacion')
export class DesignacionController {
  constructor(private readonly designacionService: DesignacionService) {}

  @Public()
  @Post()
  create(@Body() createDesignacionDto: CreateDesignacionDto) {
    try {
    return this.designacionService.create(createDesignacionDto);
  } catch (error) {
  }
  }

  @Get()
  findAll() {
    return this.designacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDesignacionDto: UpdateDesignacionDto) {
    return this.designacionService.update(+id, updateDesignacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.designacionService.remove(+id);
  }
}
