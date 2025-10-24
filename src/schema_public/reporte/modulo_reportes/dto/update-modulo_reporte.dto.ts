import { PartialType } from '@nestjs/mapped-types';
import { CreateModuloReporteDto } from './create-modulo_reporte.dto';

export class UpdateModuloReporteDto extends PartialType(CreateModuloReporteDto) {}
