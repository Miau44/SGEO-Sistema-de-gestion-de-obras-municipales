import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudDesignacionDto } from './create-solicitud_designacion.dto';

export class UpdateSolicitudDesignacionDto extends PartialType(CreateSolicitudDesignacionDto) {}
