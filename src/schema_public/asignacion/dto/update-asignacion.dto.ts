import { PartialType } from '@nestjs/mapped-types';
import { CreateAsignacionDto } from './create-asignacion.dto';

export class UpdateAsignacionDto extends PartialType(CreateAsignacionDto) {}
