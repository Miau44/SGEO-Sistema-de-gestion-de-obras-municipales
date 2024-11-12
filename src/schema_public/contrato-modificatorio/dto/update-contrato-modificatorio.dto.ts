import { PartialType } from '@nestjs/swagger';
import { CreateContratoModificatorioDto } from './create-contrato-modificatorio.dto';

export class UpdateContratoModificatorioDto extends PartialType(CreateContratoModificatorioDto) {}