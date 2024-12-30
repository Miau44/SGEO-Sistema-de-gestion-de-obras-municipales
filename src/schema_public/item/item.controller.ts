import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';
import { ItemObra } from './dto/itemObra.dto';
import { ItemAdjudicadoDto } from './dto/update-item-adjudicado.dto';


@ApiTags('item')
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  // Ruta para crear un nuevo item
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createItemDto: CreateItemDto) {
    return await this.itemService.create(createItemDto);
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
    return await this.itemService.update(+id, updateItemDto);
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

}
