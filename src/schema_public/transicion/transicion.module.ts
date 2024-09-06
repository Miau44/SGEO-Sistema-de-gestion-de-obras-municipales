import { Module } from '@nestjs/common';
import { TransicionService } from './transicion.service';
import { TransicionController } from './transicion.controller';
import { ResponseService } from 'src/response.service';
import { Transicion } from './entities/transicion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([Transicion])],

  controllers: [TransicionController],
  providers: [TransicionService, ResponseService],
})
export class TransicionModule {}
