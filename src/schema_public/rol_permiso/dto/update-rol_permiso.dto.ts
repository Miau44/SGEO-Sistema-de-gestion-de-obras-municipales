import { PartialType } from '@nestjs/mapped-types';
import { CreateRolPermisoDto } from './create-rol_permiso.dto';

export class UpdateRolPermisoDto extends PartialType(CreateRolPermisoDto) {}
