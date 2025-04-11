import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoInformeDto } from './create-tipo_informe.dto';

export class UpdateTipoInformeDto extends PartialType(CreateTipoInformeDto) {}
