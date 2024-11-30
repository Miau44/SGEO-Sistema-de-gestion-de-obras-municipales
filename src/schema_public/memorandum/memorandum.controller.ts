import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MemorandumService } from './memorandum.service';
import { CreateMemorandumDto } from './dto/create-memorandum.dto';
import { UpdateMemorandumDto } from './dto/update-memorandum.dto';
import { ApiTags } from '@nestjs/swagger';
import { GuardarObraDto } from './dto/obra_memo_informe.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Memorandum')
@Controller('memorandum')
export class MemorandumController {
  constructor(
    private readonly memorandumService: MemorandumService,
  ) {}


  @Public()
  @Post()
  create(@Body() createMemorandumDto: CreateMemorandumDto) {
    return this.memorandumService.create(createMemorandumDto);
  }

  @Get()
  findAll() {
    return this.memorandumService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memorandumService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemorandumDto: UpdateMemorandumDto) {
    return this.memorandumService.update(+id, updateMemorandumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memorandumService.remove(+id);
  }

  @Public()
  @Post('obra-memo-infor')
  guardarObraMemorandumInforme( @Body() updateMemorandumDto: GuardarObraDto) {
    try{
      return this.memorandumService.guardarObraMemorandumInforme(updateMemorandumDto);

    }catch (error){

    }}

}
