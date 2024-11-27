import { PartialType } from '@nestjs/swagger';
import { CreateContratoDto } from './create-contrato.dto';

export class UpdateContratoDto extends PartialType(CreateContratoDto) {}