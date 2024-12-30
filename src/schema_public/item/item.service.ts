import { Controller, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';
import { ResponseService } from 'src/response.service';
import { ItemObra } from './dto/itemObra.dto';
import { ItemAdjudicadoDto } from './dto/update-item-adjudicado.dto';




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
  //async findAll(): Promise<Item[]> {
  async findAll() {
    try {
      const resultado = await this.itemRepository.find();
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
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

  updateItem(id: number, updateItemDto: UpdateItemDto) {
    try {
      this.itemRepository.update(+id, updateItemDto);     
    } catch (error) {
      return this.responseService.error(error);
    }
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
      WHERE i.id_obra =$1 AND  i.id_estado =1 ORDER BY i.id_item`;
    const param =[data.id_obra]
      const resultado = await this.itemRepository.query(query, param);
      return this.responseService.success(resultado, "Listado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async exportarItems(data: ItemObra) {
    try {
      const query = ` 
      SELECT * FROM public.item WHERE id_obra=$1 AND id_estado=1`;
      const param =[data.id_obra]
      const resultado = await this.itemRepository.query(query, param);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }




  //actualizar items monto adjudicado
  async updateItemBloque(registros: ItemAdjudicadoDto[]) {
    const registrosValidados = registros
    .filter((registro) => registro.p_unitario_adjudicado >= 0)
    .map((registro) => ({
      ...registro,
      monto: this.formatMonto(registro.p_unitario_adjudicado), // Asegurarse de que el campo `monto` tenga 5 decimales
    }));

    for (const registro of registros) {
    const existente = await this.itemRepository.findOne({ where: { id_item: registro.id_item } });

    if (existente) {
      // Actualizar el registro existente
      await this.itemRepository.update({ id_item: registro.id_item }, registro);
    } else {
      // Si no existe, puedes decidir si ignorarlo o insertarlo como un nuevo registro
      console.warn(`Registro con id_item ${registro.id_item} no encontrado.`);
    }
  }

  }

  private formatMonto(monto: string | number): string {
    if (typeof monto === 'string') {
      // Remover comas y convertir a número
      monto = parseFloat(monto.replace(',', ''));
    }
    // Formatear el número a 5 decimales y convertirlo de nuevo a formato string con coma
    return monto.toFixed(5).replace('.', ',');
  }
    
    

}
