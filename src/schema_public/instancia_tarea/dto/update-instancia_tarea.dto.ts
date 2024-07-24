import { PartialType } from '@nestjs/mapped-types';
import { CreateInstanciaTareaDto } from './create-instancia_tarea.dto';

export class UpdateInstanciaTareaDto extends PartialType(CreateInstanciaTareaDto) {}
