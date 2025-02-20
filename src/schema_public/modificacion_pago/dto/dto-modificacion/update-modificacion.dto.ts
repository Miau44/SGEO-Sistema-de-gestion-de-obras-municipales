import { PartialType } from '@nestjs/mapped-types';

import { CreateModificacionDto } from '../create-modificacion.dto';

export class UpdateModificacionDto extends PartialType(CreateModificacionDto) {}
