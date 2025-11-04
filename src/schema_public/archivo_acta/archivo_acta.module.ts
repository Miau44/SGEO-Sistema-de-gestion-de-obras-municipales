import { Module } from '@nestjs/common';
import { ArchivoActaService } from './archivo_acta.service';
import { ArchivoActaController } from './archivo_acta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchivoActa } from './entities/archivo_acta.entity';

@Module({
  imports: [ 
      TypeOrmModule.forFeature([ArchivoActa])], 
  controllers: [ArchivoActaController],
  providers: [ArchivoActaService],
})
export class ArchivoActaModule {}
