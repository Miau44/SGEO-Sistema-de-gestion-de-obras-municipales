import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CorrelativoMemoService } from './correlativo_memo.service';
import { CreateCorrelativoMemoDto } from './dto/create-correlativo_memo.dto';
import { UpdateCorrelativoMemoDto } from './dto/update-correlativo_memo.dto';

@Controller('correlativo-memo')
export class CorrelativoMemoController {
  constructor(private readonly correlativoMemoService: CorrelativoMemoService) {}

  @Post()
  create(@Body() createCorrelativoMemoDto: CreateCorrelativoMemoDto) {
    return this.correlativoMemoService.create(createCorrelativoMemoDto);
  }

  @Get()
  findAll() {
    return this.correlativoMemoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.correlativoMemoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCorrelativoMemoDto: UpdateCorrelativoMemoDto) {
    return this.correlativoMemoService.update(+id, updateCorrelativoMemoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.correlativoMemoService.remove(+id);
  }
}
