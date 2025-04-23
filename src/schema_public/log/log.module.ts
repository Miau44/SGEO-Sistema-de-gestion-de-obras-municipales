import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { Log } from './entities/log.entity'; 
import { ResponseService } from 'src/response.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [LogController],
  providers: [LogService, ResponseService, ConfigService],
  exports: [LogService]
})
export class LogModule {}
