import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';
import { ItemObra } from './dto/item-obra.dto';
import { ItemAdjudicadoDto } from './dto/update-item-adjudicado.dto';
import { Modificacion } from './entities/modificacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { CreateModificacionDto } from './dto/create-modificacion.dto';


@ApiTags('item')
@Controller('items')
export class ItemController {
  constructor(
    @InjectRepository(Modificacion) private modificacionRepository: Repository<Modificacion>,
    private readonly itemService: ItemService) { }

  // Ruta para crear un nuevo item
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createItemDto: CreateItemDto) {
    try {
    return await this.itemService.create(createItemDto);
  } catch (error) { } 
  }


  @Public()
  @Post('crear-item-nuevo')
  async crearItems(@Body() createItemDto: CreateItemDto) {
    try {
    return await this.itemService.guardarItemNuevos(createItemDto);
  } catch (error) { } 
}

  // Ruta para obtener todos los items
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    try {    
    return await this.itemService.findAll();
  } catch (error) { }    
  }

  // Ruta para obtener un item por id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.itemService.findOne(+id);
  }

  // Ruta para actualizar un item por id

  @Public()
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    try{
    return await this.itemService.update(+id, updateItemDto);
    }catch (error) { }
  }

  // Ruta para eliminar un item por id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.itemService.remove(+id);
  }

@Public()
  @Post('items-obra')
  async itemXObra(@Body() itemObra: ItemObra) {
    return await this.itemService.listarItemsXObra(itemObra);
  }

  @Public()
  @Post('items-obra-x-tipo')
  async itemXObraXTipo(@Body() itemObra: ItemObra) {
    return await this.itemService.listarItemsXObraXTipo(itemObra);
  }


  @Public()
  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  async updateItem(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    try {
      return await this.itemService.updateItem(+id, updateItemDto);
    } catch (error) {
    }
  }


//exportar items para monto adjudicado
  @Public()
  @Post('exportar-items')
  async exportarItems(@Body() itemObra: ItemObra) {
    return await this.itemService.exportarItems(itemObra);
  }  

//exportar items para monto adjudicado
@Public()
@Post('update-item-bloque')
async updateItemBloque(@Body() item: ItemAdjudicadoDto[]) {
  return await this.itemService.updateItemBloque(item);
}    


@Public()
@Post('/items-sgpu')
async itemsSGPU(@Body() itemObra: ItemObra) {
  return this.itemService.listaItemSGPU(itemObra);
}



/////////////////////////modificacion/////////////////////////

@Post('modificacion-create')
@HttpCode(HttpStatus.CREATED)
async createModificacion(@Body() createModificacion: CreateModificacionDto) {
  try {
  return await this.itemService.createModificacion(createModificacion);
} catch (error) {
}
}



@Public()
@Post('modificacion-lista')
listaPersonas(@Body() documentoDto: ItemObra) {
  try {  
    return this.itemService.listaModificacion(documentoDto);
  } catch (error) {
  }
}



}
