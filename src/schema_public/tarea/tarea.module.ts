import { Module } from '@nestjs/common';
import { TareaService } from './tarea.service';
import { TareaController } from './tarea.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { Tarea } from './entities/tarea.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Tarea])],

  controllers: [TareaController],
  providers: [TareaService, ResponseService],
})
export class TareaModule {}
