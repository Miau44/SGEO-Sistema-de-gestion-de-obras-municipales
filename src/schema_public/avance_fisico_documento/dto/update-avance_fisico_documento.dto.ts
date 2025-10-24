import { PartialType } from '@nestjs/swagger';
import { CreateAvanceFisicoDocumentoDto } from './create-avance_fisico_documento.dto';

export class UpdateAvanceFisicoDocumentoDto extends PartialType(CreateAvanceFisicoDocumentoDto) {}
