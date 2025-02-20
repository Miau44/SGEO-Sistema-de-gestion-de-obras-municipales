import { PartialType } from '@nestjs/mapped-types';
import { CreateComputoDto } from './create-computo.dto';

export class UpdateComputoDto extends PartialType(CreateComputoDto) {}
