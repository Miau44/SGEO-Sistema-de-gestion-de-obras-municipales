import { PartialType } from '@nestjs/mapped-types';
import { CreateReinicioDto } from './create-reinicio.dto';


export class UpdateReinicioDto extends PartialType(CreateReinicioDto) {}