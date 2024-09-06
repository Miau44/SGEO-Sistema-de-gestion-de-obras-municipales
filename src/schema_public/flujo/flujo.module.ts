import { Module } from '@nestjs/common';
import { FlujoService } from './flujo.service';
import { FlujoController } from './flujo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { Flujo } from './entities/flujo.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Flujo])],

  controllers: [FlujoController],
  providers: [FlujoService, ResponseService],
})
export class FlujoModule {}
