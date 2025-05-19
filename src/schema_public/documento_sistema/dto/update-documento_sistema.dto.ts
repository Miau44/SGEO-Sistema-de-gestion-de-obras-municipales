import { PartialType } from '@nestjs/swagger';
import { CreateDocumentoSistemaDto } from './create-documento_sistema.dto';

export class UpdateDocumentoSistemaDto extends PartialType(CreateDocumentoSistemaDto) {}
