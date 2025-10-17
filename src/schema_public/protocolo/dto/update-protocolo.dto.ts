import { PartialType } from '@nestjs/swagger';
import { CreateProtocoloDto } from './create-protocolo.dto';

export class UpdateProtocoloDto extends PartialType(CreateProtocoloDto) {}
