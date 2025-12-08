import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { Item } from './entities/item.entity';
import { ResponseService } from 'src/response.service';
//import { ExternoService } from 'src/schema_private/externo/externo.service';
import { PlanillaService } from '../planilla/planilla.service';
import { Planilla } from '../planilla/entities/planilla.entity';
import { LogModule } from '../log/log.module';
import { ObraService } from '../obra/obra.service';
import { Obra } from '../obra/entities/obra.entity';
import { InformeService } from '../informe/informe_inicial.service';
import { Informe } from '../informe/entities/informe.entity';
import { InformeInicial } from '../informe/entities/informe_inicial.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { SolicitudHistorial } from '../solicitud/entities/solicitud_historial.entity';
import { Documento } from '../documento/entities/documento.entity';
import { SolicitudService } from '../solicitud/solicitud.service';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { Correlativo } from '../correlativo/entities/correlativo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Planilla, Obra, Informe, InformeInicial, Solicitud, SolicitudHistorial, Documento, Correlativo]), LogModule], // Se importa la entidad Item para TypeORM
  controllers: [ItemController],
  providers: [ItemService, ResponseService,  PlanillaService, ObraService, InformeService, SolicitudService, CorrelativoService], 
  exports: [ItemService],  // Esto permite que el servicio sea usado en otros módulos si es necesario
})
export class ItemModule {}