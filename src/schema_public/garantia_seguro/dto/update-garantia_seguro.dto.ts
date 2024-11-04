import { PartialType } from "@nestjs/swagger";
import { CreateGarantiaSeguroDto } from './create-garantia_seguro.dto';

export class UpdateGarantiaSeguroDto extends PartialType(CreateGarantiaSeguroDto) {}
