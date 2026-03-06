import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchivoActaService } from './archivo_acta.service';
import { ArchivoActaController } from './archivo_acta.controller';
import { ArchivoActa } from './entities/archivo_acta.entity';
import { Informe } from '../informe/entities/informe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArchivoActa,
      Informe, 
    ]),
  ],
  controllers: [ArchivoActaController],
  providers: [ArchivoActaService],
})
export class ArchivoActaModule {}