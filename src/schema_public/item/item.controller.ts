import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, HttpException } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseService } from 'src/response.service';
import { ItemObraDto } from './dto/item-obra.dto';
import { ItemAdjudicadoDto } from './dto/update-item-adjudicado.dto';

import { ModificacionPago } from '../modificacion_pago/entities/modificacion_pago.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';

import { ItemEstadoDto } from './dto/item-estado.dto';
import { ItemFinalizarDto } from './dto/item-finalizar.dto';



@ApiTags('item')
@Controller('items')
export class ItemController {
  constructor(

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



  @Get(':id')
  findOneItem(@Param('id') id: string) {
    try {
      return this.itemService.findItem(+id);
    } catch (error) {
      throw new HttpException('Error al obtener la modificación', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return this.itemService.findOne(+id);
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
  async itemXObra(@Body() itemObra: ItemObraDto) {
    return await this.itemService.listarItemsXObra(itemObra);
  }

  @Public()
  @Post('items-obra-x-tipo')
  async itemXObraXTipo(@Body() itemObra: ItemObraDto) {
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
  async exportarItems(@Body() itemObra: ItemObraDto) {
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
async itemsSGPU(@Body() itemObra: ItemObraDto) {
  return this.itemService.listaItemSGPU(itemObra);
}


  @Public()
  @Post('item-actualizar-estado')
  actualizarJustificacion(@Body() itemEstadoDto: ItemEstadoDto) {
    try {  
      return this.itemService.actualizarEstado(itemEstadoDto);
    } catch (error) {
    }
  }


  @Public()
  @Post('item-finalizar-orden')
finalizarOrdenItem(@Body() itemEstadoDto: ItemFinalizarDto) {
    try {  
      return this.itemService.finalizarOrdenItem(itemEstadoDto);
    } catch (error) {
    }
  }


  @Public()
  @Post('item-finalizar')
  finalizarItem(@Body() itemEstadoDto: ItemFinalizarDto) {
    try {  
      return this.itemService.finalizarItem(itemEstadoDto);
    } catch (error) {
    }
  }  

}
