import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubrolesService } from './subroles.service';
import { SubrolesController } from './subroles.controller';
import { Persona } from '../persona/entities/persona.entity';
import { PersonaPermiso } from '../persona_permiso/entities/persona_permiso.entity';
import { RolPermiso } from '../rol_permiso/entities/rol_permiso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Persona, PersonaPermiso, RolPermiso])],
  controllers: [SubrolesController],
  providers: [SubrolesService],
  exports: [SubrolesService],
})
export class SubrolesModule {}
