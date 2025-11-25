import { Module } from '@nestjs/common';
import { ExternoService } from './externo.service';
import { ExternoController } from './externo.controller';
import { LogModule } from 'src/schema_public/log/log.module';
import { ResponseService } from 'src/response.service';
import { ObraService } from 'src/schema_public/obra/obra.service';
import { ObraModule } from 'src/schema_public/obra/obra.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Obra } from 'src/schema_public/obra/entities/obra.entity';
import { ParametricaService } from 'src/schema_public/parametrica/services/parametrica.service';
import { ParametricaModule } from 'src/schema_public/parametrica/parametrica.module';
import { ComputoModule } from 'src/schema_public/computo/computo.module';
import { ComputoService } from 'src/schema_public/computo/computo.service';
import { Parametrica } from 'src/schema_public/parametrica/entities/parametrica.entity';

@Module({
  //imports: [LogModule, ObraModule],

  imports: [TypeOrmModule.forFeature([Obra, Parametrica]), LogModule, ParametricaModule], // Se importa la entidad Item para TypeORM

  controllers: [ExternoController],
  providers: [ExternoService,ResponseService, ObraService, ParametricaService],
  exports: [ExternoService],  // Esto permite que el servicio sea usado en otros módulos si es necesario

})
export class ExternoModule {}
