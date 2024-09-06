import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransicionService } from './transicion.service';
import { CreateTransicionDto } from './dto/create-transicion.dto';
import { UpdateTransicionDto } from './dto/update-transicion.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';


@ApiTags('transicion')
@Controller('transicion')
export class TransicionController {
  constructor(private readonly transicionService: TransicionService) {}

  @Public()
  @Post()
  create(@Body() createTransicionDto: CreateTransicionDto) {
   try{
    return this.transicionService.create(createTransicionDto);
  } catch (error) {
  }
  }

  @Get()
  findAll() {
    return this.transicionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transicionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransicionDto: UpdateTransicionDto) {
    return this.transicionService.update(+id, updateTransicionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transicionService.remove(+id);
  }
}
