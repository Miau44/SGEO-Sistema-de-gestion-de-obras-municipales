import { Module } from '@nestjs/common';
import { FichaService } from './ficha.service';
import { FichaController } from './ficha.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { Ficha } from './entities/ficha.entity';



@Module({
  imports: [TypeOrmModule.forFeature([Ficha])],

  controllers: [FichaController],
  providers: [FichaService, ResponseService],
})
export class FichaModule {}
