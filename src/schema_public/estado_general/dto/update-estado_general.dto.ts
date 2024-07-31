import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoGeneralDto } from './create-estado_general.dto';

export class UpdateEstadoGeneralDto extends PartialType(CreateEstadoGeneralDto) {}
