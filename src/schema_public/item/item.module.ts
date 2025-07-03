import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { Item } from './entities/item.entity';
import { ResponseService } from 'src/response.service';
import { ExternoService } from 'src/schema_private/externo/externo.service';
import { PlanillaService } from '../planilla/planilla.service';
import { Planilla } from '../planilla/entities/planilla.entity';
import { LogModule } from '../log/log.module';
import { ObraService } from '../obra/obra.service';
import { Obra } from '../obra/entities/obra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Planilla, Obra ]), LogModule], // Se importa la entidad Item para TypeORM
  controllers: [ItemController],
  providers: [ItemService, ResponseService, ExternoService, PlanillaService, ObraService], 
  exports: [ItemService],  // Esto permite que el servicio sea usado en otros módulos si es necesario
})
export class ItemModule {}