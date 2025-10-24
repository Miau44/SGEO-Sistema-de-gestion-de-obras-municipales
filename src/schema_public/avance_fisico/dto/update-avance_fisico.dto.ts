import { PartialType } from '@nestjs/swagger';
import { CreateAvanceFisicoDto } from './create-avance_fisico.dto';

export class UpdateAvanceFisicoDto extends PartialType(CreateAvanceFisicoDto) {}
