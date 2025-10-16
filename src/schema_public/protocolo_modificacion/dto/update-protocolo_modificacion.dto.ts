import { PartialType } from '@nestjs/swagger';
import { CreateProtocoloModificacionDto } from './create-protocolo_modificacion.dto';

export class UpdateProtocoloModificacionDto extends PartialType(CreateProtocoloModificacionDto) {}
