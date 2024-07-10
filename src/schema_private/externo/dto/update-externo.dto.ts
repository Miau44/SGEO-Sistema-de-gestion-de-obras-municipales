import { PartialType } from '@nestjs/mapped-types';
import { CreateExternoDto } from './create-externo.dto';

export class UpdateExternoDto extends PartialType(CreateExternoDto) {}
