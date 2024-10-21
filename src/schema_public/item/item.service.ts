import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

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
}
