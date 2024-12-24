import { Controller, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';
import { ResponseService } from 'src/response.service';
import { ItemObra } from './dto/itemObra.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    private responseService: ResponseService,
  ) { }

  // Crear un nuevo item
  async create(createItemDto: CreateItemDto): Promise<Item> {
    const newItem = this.itemRepository.create(createItemDto);
    return await this.itemRepository.save(newItem);
  }

  // Obtener todos los items
  async findAll(): Promise<Item[]> {
    return await this.itemRepository.find();
  }

  // Obtener un item por id
  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id_item: id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  // Actualizar un item por id
  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    await this.itemRepository.update(id, updateItemDto);
    return this.findOne(id);  // Devolver el item actualizado
  }

  // Eliminar un item por id
  async remove(id: number): Promise<void> {
    await this.itemRepository.delete(id);
  }


  async listarItemsXObra(data: ItemObra) {
    try {
      const query = ` 

      SELECT i.id_item, f.desc_carpeta, i.codigo_item, i.unidad_medida_sim, i.desc_item_sim, 
      REPLACE(to_char(i.cantidad_sim,'999G999G999G999D99'), ' ', '') as cantidad_sim,	 
      REPLACE(to_char(i.p_unitario_sim,'999G999G999G999D99'), ' ', '') as p_unitario_sim,	  
      REPLACE(to_char(i.total_item_sim,'999G999G999G999D99'), ' ', '') as total_item_sim,	  
      REPLACE(to_char(i.p_unitario_adjudicado,'999G999G999G999D99'), ' ', '') as p_unitario_adjudicado,	  
      REPLACE(to_char(i.total_adjudicado,'999G999G999G999D99'), ' ', '') as total_adjudicado	  
      FROM public.obra AS o
      INNER JOIN public.item  AS i ON o.id_obra = i.id_obra
      INNER JOIN public.ficha AS f ON o.id_ficha = f.id_ficha
      WHERE i.id_obra =$1 AND  i.id_estado =1`;
    const param =[data.id_obra]

      const resultado = await this.itemRepository.query(query, param);

      return this.responseService.success(resultado, "Listado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }

}
