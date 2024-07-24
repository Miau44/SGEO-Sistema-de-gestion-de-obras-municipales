import { Module } from '@nestjs/common';
import { DesignacionService } from './designacion.service';
import { DesignacionController } from './designacion.controller';
import { ResponseService } from 'src/response.service';
import { Designacion } from './entities/designacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([Designacion])],

  controllers: [DesignacionController],
  providers: [DesignacionService, ResponseService],
})
export class DesignacionModule {}
