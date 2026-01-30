import { PartialType } from '@nestjs/mapped-types';
import { CreateSuspensionDto } from './create-suspension.dto';

export class UpdateSuspensionDto extends PartialType(CreateSuspensionDto) {}
