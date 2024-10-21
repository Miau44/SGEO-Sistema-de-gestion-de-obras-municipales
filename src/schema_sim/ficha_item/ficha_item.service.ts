import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { CreateFichaDto } from './../../schema_public/ficha/dto/create-ficha.dto';
import { CreateObraDto } from './../../schema_public/obra/dto/create-obra.dto';
import { Ficha } from './../../schema_public/ficha/entities/ficha.entity';
import { Obra } from './../../schema_public/obra/entities/obra.entity';
import { Item } from './../../schema_public/item/entities/item.entity';  // Importamos la entidad de item
import { Documento } from '../../schema_public/documento/entities/documento.entity';  

@Injectable()
export class ficha_itemService {
  constructor(
    @InjectRepository(Ficha)
    private fichaRepository: Repository<Ficha>,

    @InjectRepository(Obra)
    private obraRepository: Repository<Obra>,

    @InjectRepository(Item)  // Añadimos el repositorio de Item
    private itemRepository: Repository<Item>,

    @InjectRepository(Documento)  // Nuevo repositorio
    private documentoRepository: Repository<Documento>,
    private connection: Connection
  ) {}

  // Método para crear Ficha, Obra y Items
  async importarFicha(
    createFichaDto: CreateFichaDto,
    createObraDto: CreateObraDto,
    itemsJson: any[],  // Array de items pasados en el body
    documentosJson: any[]  // JSON de documentos
  ): Promise<void> {
    await this.connection.transaction(async (manager) => {
      // Insertar en la tabla "fichas"
      const ficha = manager.create(Ficha, createFichaDto);
      await manager.save(ficha);

      // Insertar en la tabla "obras", haciendo referencia a la Ficha recién creada
      const obra = manager.create(Obra, {
        ...createObraDto,
        ficha: ficha,  // Relacionar la obra con la ficha
      });
      const obraGuardada = await manager.save(obra);
      const id_obra = obraGuardada.id_obra;
      console.log(itemsJson);
      
      // Insertar en la tabla "items"
      for (const item of itemsJson) {
        const newItem = manager.create(Item, {
          ...item,
          id_obra: id_obra,  // Asignamos el id_obra generado
        });
        await manager.save(newItem);
      }

      // Insertar en la tabla "documentos"
      for (const documento of documentosJson) {
        const newDocumento = manager.create(Documento, {
          ...documento,
          id_obra: id_obra,  // Relacionar el documento con la obra
        });
        await manager.save(newDocumento);
      }
    });
  }
}