import { PartialType } from '@nestjs/mapped-types';
import { CreateCorrelativoDto } from './create-correlativo.dto';

export class UpdateCorrelativoDto extends PartialType(CreateCorrelativoDto) {}
