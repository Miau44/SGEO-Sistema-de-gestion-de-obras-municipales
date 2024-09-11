import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
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

  @Public()  
  @Get()
  findAll() {
    try {
    return this.transicionService.findAll();
  } catch (error) {
  }       
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transicionService.findOne(+id);
  }



  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransicionDto: UpdateTransicionDto) {
    try {  
    return this.transicionService.update(+id, updateTransicionDto);
  } catch (error) {
  }
      
  }
 
  @Public()
  @Delete(':id')
  async eliminarFlujo(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      return this.transicionService.eliminarTransicion(id);
    } catch (error) {
    }
  }

/*
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transicionService.remove(+id);
  }*/
}
