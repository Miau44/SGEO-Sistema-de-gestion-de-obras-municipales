import { PartialType } from '@nestjs/mapped-types';
import { CreateDesignacionDto } from './create-designacion.dto';

export class UpdateDesignacionDto extends PartialType(CreateDesignacionDto) {}
