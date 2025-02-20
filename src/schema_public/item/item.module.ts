import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { Item } from './entities/item.entity';
import { ResponseService } from 'src/response.service';
import { ExternoService } from 'src/schema_private/externo/externo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Item ])], // Se importa la entidad Item para TypeORM
  controllers: [ItemController],
  providers: [ItemService, ResponseService, ExternoService], 
  exports: [ItemService],  // Esto permite que el servicio sea usado en otros módulos si es necesario
})
export class ItemModule {}