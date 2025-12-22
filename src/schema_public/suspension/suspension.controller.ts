import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SuspensionService } from './suspension.service';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { UpdateSuspensionDto } from './dto/update-suspension.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { SuspensionObraDto } from './suspension-obra.dto';
import { CreateReinicioDto } from './dto/dto-reinicio/create-reinicio.dto';

@ApiTags('suspension')
@Controller('suspension')
export class SuspensionController {
  constructor(private readonly suspensionService: SuspensionService) { }

  @Post()
  create(@Body() createSuspensionDto: CreateSuspensionDto) {
    try {
      return this.suspensionService.create(createSuspensionDto);
    } catch { }
  }

  @Get()
  findAll() {
    try {    
    return this.suspensionService.findAll();
 } catch (error) { }    
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suspensionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSuspensionDto: UpdateSuspensionDto) {
    try {
      return this.suspensionService.update(+id, updateSuspensionDto);
    } catch { }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suspensionService.remove(+id);
  }



@Public()
  @Post('lista-suspension')
  listaSuspension(@Body() data: SuspensionObraDto) {
    try {  
      return this.suspensionService.listaSupension(data);
    } catch (error) {
    }
  }  

  @Public()
  @Post('lista-suspension-obra')
  listaSuspensionCodigo(@Body() data: SuspensionObraDto) {
    try {  
      return this.suspensionService.listaSupensionXObra(data);
    } catch (error) {
    }
  }  
  

 @Post('create-reinicio')
  createReinicio(@Body() createReinicioDto: CreateReinicioDto) {
    try {
      return this.suspensionService.createReinicio(createReinicioDto);
    } catch { }
  }


}
