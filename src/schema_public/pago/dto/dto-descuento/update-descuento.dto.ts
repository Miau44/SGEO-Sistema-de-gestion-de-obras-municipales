import { PartialType } from '@nestjs/mapped-types';
import { CreateDescuentoDto } from './create-descuento.dto';

export class UpdateDescuentoDto extends PartialType(CreateDescuentoDto) {}
