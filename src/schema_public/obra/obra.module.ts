import { Module } from '@nestjs/common';
import { ObraService } from './obra.service';
import { ObraController } from './obra.controller';
import { ResponseService } from 'src/response.service';
import { Obra } from './entities/obra.entity';
import { TypeOrmModule } from '@nestjs/typeorm';




@Module({
  imports: [TypeOrmModule.forFeature([Obra])],

  controllers: [ObraController],
  providers: [ObraService, ResponseService],
})
export class ObraModule {}
