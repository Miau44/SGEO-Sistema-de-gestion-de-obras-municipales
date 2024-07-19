import { Module } from '@nestjs/common';
import { SolicitudDesignacionService } from './solicitud_designacion.service';
import { SolicitudDesignacionController } from './solicitud_designacion.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudDesignacion } from './entities/solicitud_designacion.entity';


@Module({
  imports: [TypeOrmModule.forFeature([SolicitudDesignacion])],

  controllers: [SolicitudDesignacionController],
  providers: [SolicitudDesignacionService, ResponseService],
})
export class SolicitudDesignacionModule {}
