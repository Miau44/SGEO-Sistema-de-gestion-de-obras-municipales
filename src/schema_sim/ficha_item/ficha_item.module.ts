import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ficha_itemService } from './ficha_item.service';
import { FichaItemController } from './ficha_item.controller';
import { Ficha } from './../../schema_public/ficha/entities/ficha.entity';
import { Obra } from './../../schema_public/obra/entities/obra.entity';
import { Item } from './../../schema_public/item/entities/item.entity';
import { Documento } from './../../schema_public/documento/entities/documento.entity';
import { ResponseService } from 'src/response.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ficha, Obra, Item, Documento]) // Registrar las entidades Ficha, Obra, Item y Documento
  ],
  controllers: [FichaItemController],
  providers: [ficha_itemService,ResponseService],
  exports : [ficha_itemService],
})
export class FichaItemModule {}