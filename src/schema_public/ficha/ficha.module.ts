import { Module } from '@nestjs/common';
import { FichaService } from './ficha.service';
import { FichaController } from './ficha.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { Ficha } from './entities/ficha.entity';
import { Obra } from 'src/schema_public/obra/entities/obra.entity';
import { FichaItemModule } from 'src/schema_sim/ficha_item/ficha_item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ficha, Obra]),
    FichaItemModule,
  ],
  controllers: [FichaController],
  providers: [FichaService, ResponseService],
})
export class FichaModule {}