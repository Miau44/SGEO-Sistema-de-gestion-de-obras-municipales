import { PartialType } from '@nestjs/mapped-types';
import { CreateTransicionDto } from './create-transicion.dto';

export class UpdateTransicionDto extends PartialType(CreateTransicionDto) {}
