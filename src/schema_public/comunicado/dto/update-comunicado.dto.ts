import { PartialType } from '@nestjs/swagger';
import { CreateComunicadoDto } from './create-comunicado.dto';

export class UpdateComunicadoDto extends PartialType(CreateComunicadoDto) {}
