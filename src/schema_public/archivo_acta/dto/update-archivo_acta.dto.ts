import { PartialType } from '@nestjs/swagger';
import { CreateArchivoActaDto } from './create-archivo_acta.dto';

export class UpdateArchivoActaDto extends PartialType(CreateArchivoActaDto) {
    
}
