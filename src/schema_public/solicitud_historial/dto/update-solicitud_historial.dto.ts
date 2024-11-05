import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudHistorialDto } from './create-solicitud_historial.dto';

export class UpdateSolicitudHistorialDto extends PartialType(CreateSolicitudHistorialDto) {}
