import { PartialType } from '@nestjs/mapped-types';
import { CreateInformeInicialDto } from './create-informe-inicial.dto';

export class UpdateInformeInicialDto extends PartialType(CreateInformeInicialDto) {}
