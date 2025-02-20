import { PartialType } from '@nestjs/mapped-types';
import { CreateModificacionPagoDto } from './create-modificacion_pago.dto';

export class UpdateModificacionPagoDto extends PartialType(CreateModificacionPagoDto) {}
