import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoDocumentoDto } from './create-tipo_documento.dto';

export class UpdateTipoDocumentoDto extends PartialType(CreateTipoDocumentoDto) {}
