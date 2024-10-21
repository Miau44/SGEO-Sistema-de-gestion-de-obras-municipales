import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

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
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.itemService.findAll();
  }

  // Ruta para obtener un item por id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.itemService.findOne(+id);
  }

  // Ruta para actualizar un item por id
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
}
