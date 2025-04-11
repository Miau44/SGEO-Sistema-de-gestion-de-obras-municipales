import { PartialType } from '@nestjs/mapped-types';
import { CreateParametricaDto } from './create-parametrica.dto';

export class UpdateParametricaDto extends PartialType(CreateParametricaDto) {}
