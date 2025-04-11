import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanillaDto } from './create-planilla.dto';

export class UpdatePlanillaDto extends PartialType(CreatePlanillaDto) {}
