import { Module } from '@nestjs/common';
import { TareaService } from './tarea.service';
import { TareaController } from './tarea.controller';

@Module({
  controllers: [TareaController],
  providers: [TareaService],
})
export class TareaModule {}
