import { PartialType } from '@nestjs/mapped-types';
import { CreateEstructuraOrganizacionalDto } from './create-estructura_organizacional.dto';

export class UpdateEstructuraOrganizacionalDto extends PartialType(CreateEstructuraOrganizacionalDto) {}
