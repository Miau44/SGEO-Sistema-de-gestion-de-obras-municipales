import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoSolicitudDto } from './create-estado_solicitud.dto';

export class UpdateEstadoSolicitudDto extends PartialType(CreateEstadoSolicitudDto) {}
