import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudEstadoDto } from './create-solicitud_estado.dto';

export class UpdateSolicitudEstadoDto extends PartialType(CreateSolicitudEstadoDto) {}
