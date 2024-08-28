import { Module } from '@nestjs/common';
import { PersonaPermisoService } from './persona_permiso.service';
import { PersonaPermisoController } from './persona_permiso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonaPermiso } from './entities/persona_permiso.entity';
import { ResponseService } from 'src/response.service';


@Module({

  imports: [TypeOrmModule.forFeature([PersonaPermiso])],

  controllers: [PersonaPermisoController],
  providers: [PersonaPermisoService, ResponseService],
})
export class PersonaPermisoModule {}
