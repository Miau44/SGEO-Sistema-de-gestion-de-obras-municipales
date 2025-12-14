import { Module } from '@nestjs/common';
import { SuspensionService } from './suspension.service';
import { SuspensionController } from './suspension.controller';
import { Suspension } from './entities/suspension.entity';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reinicio } from './entities/reinicio.entity';

@Module({

  imports: [TypeOrmModule.forFeature([Suspension, Reinicio])],
  
  controllers: [SuspensionController],
  providers: [SuspensionService],
})
export class SuspensionModule {}
