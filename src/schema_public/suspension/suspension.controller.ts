import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SuspensionService } from './suspension.service';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { UpdateSuspensionDto } from './dto/update-suspension.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('suspension')
@Controller('suspension')
export class SuspensionController {
  constructor(private readonly suspensionService: SuspensionService) {}

  @Post()
  create(@Body() createSuspensionDto: CreateSuspensionDto) {
    return this.suspensionService.create(createSuspensionDto);
  }

  @Get()
  findAll() {
    return this.suspensionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suspensionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSuspensionDto: UpdateSuspensionDto) {
    return this.suspensionService.update(+id, updateSuspensionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suspensionService.remove(+id);
  }
}
