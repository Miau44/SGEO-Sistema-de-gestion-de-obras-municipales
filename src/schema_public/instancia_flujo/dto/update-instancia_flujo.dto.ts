import { PartialType } from '@nestjs/mapped-types';
import { CreateInstanciaFlujoDto } from './create-instancia_flujo.dto';

export class UpdateInstanciaFlujoDto extends PartialType(CreateInstanciaFlujoDto) {}
