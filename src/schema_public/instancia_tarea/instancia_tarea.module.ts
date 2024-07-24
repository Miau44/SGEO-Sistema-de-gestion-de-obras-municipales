import { Module } from '@nestjs/common';
import { InstanciaTareaService } from './instancia_tarea.service';
import { InstanciaTareaController } from './instancia_tarea.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResponseService } from 'src/response.service';
import { InstanciaTarea } from './entities/instancia_tarea.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstanciaTarea])],
  controllers: [InstanciaTareaController],
  providers: [InstanciaTareaService, ResponseService],
})
export class InstanciaTareaModule {}
