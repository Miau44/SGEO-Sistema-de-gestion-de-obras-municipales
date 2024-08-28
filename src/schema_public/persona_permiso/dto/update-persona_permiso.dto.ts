import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonaPermisoDto } from './create-persona_permiso.dto';

export class UpdatePersonaPermisoDto extends PartialType(CreatePersonaPermisoDto) {}
