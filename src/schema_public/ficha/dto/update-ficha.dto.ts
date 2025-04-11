import { PartialType } from '@nestjs/mapped-types';
import { CreateFichaDto } from './create-ficha.dto';

export class UpdateFichaDto extends PartialType(CreateFichaDto) {}
