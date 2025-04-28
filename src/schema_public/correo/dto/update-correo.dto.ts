import { PartialType } from '@nestjs/swagger';
import { CreateCorreoDto } from './create-correo.dto';

export class UpdateCorreoDto extends PartialType(CreateCorreoDto) {}
