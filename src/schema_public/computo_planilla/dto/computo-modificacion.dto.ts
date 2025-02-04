
import { ApiProperty } from '@nestjs/swagger';

export class ComputoModificacionDto {
    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_modificacion: number;
     
 
}