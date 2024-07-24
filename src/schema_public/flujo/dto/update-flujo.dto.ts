import { PartialType } from '@nestjs/mapped-types';
import { CreateFlujoDto } from './create-flujo.dto';

export class UpdateFlujoDto extends PartialType(CreateFlujoDto) {}
