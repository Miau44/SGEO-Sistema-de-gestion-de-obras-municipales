import { PartialType } from '@nestjs/mapped-types';
import { CreateGarantiaSeguroDto } from './create-garantia_seguro.dto';

export class UpdateGarantiaSeguroDto extends PartialType(CreateGarantiaSeguroDto) {}
