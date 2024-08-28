import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonapermisoUeDto } from './create-personapermiso_ue.dto';

export class UpdatePersonapermisoUeDto extends PartialType(CreatePersonapermisoUeDto) {}
