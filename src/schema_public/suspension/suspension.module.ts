import { Module } from '@nestjs/common';
import { SuspensionService } from './suspension.service';
import { SuspensionController } from './suspension.controller';
import { Suspension } from './entities/suspension.entity';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reinicio } from './entities/reinicio.entity';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { Correlativo } from '../correlativo/entities/correlativo.entity';
import { MemorandumService } from '../memorandum/memorandum.service';
import { Memorandum } from '../memorandum/entities/memorandum.entity';
import { Obra } from '../obra/entities/obra.entity';
import { Informe } from '../informe/entities/informe.entity';
import { Contrato } from '../contrato-modificatorio/entities/contrato.entity';
import { CorreoModule } from '../correo/correo.module';
import { Correo } from '../correo/entities/correo.entity';



@Module({

  imports: [TypeOrmModule.forFeature([Suspension, Reinicio, Correlativo, Memorandum, Obra, Informe, Contrato, Correo]),CorreoModule ],
  
  controllers: [SuspensionController],
  providers: [SuspensionService, ResponseService, CorrelativoService, MemorandumService],
   exports: [SuspensionService]  
})
export class SuspensionModule {}
