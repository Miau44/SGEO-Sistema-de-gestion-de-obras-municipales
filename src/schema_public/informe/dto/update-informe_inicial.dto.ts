import { PartialType } from '@nestjs/mapped-types';
import { CreateInformeInicialDto } from './create-informe_inicial.dto';

export class UpdateInformeInicialDto extends PartialType(CreateInformeInicialDto) {}
