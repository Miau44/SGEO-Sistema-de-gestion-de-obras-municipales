import { Module } from '@nestjs/common';
import { EstructuraOrganizacionalService } from './estructura_organizacional.service';
import { EstructuraOrganizacionalController } from './estructura_organizacional.controller';
import { ResponseService } from 'src/response.service';
import { EstructuraOrganizacional } from './entities/estructura_organizacional.entity';
import { EstructuraOrganizacionalNuevo } from './entities/estructura_organizacional_nuevo.entity';
import { Persona } from '../../schema_public/persona/entities/persona.entity';
import { PersonaPermiso } from 'src/schema_public/persona_permiso/entities/persona_permiso.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([EstructuraOrganizacional, EstructuraOrganizacionalNuevo,Persona,PersonaPermiso])],

  controllers: [EstructuraOrganizacionalController],
  providers: [EstructuraOrganizacionalService, ResponseService],
})
export class EstructuraOrganizacionalModule {}