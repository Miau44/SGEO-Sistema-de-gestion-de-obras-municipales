

import { ApiProperty } from '@nestjs/swagger';

export class ComputoImportarDto {
    @ApiProperty()
    id_modificacion: number;

    @ApiProperty()
    id_tipo_computo: number;    

    @ApiProperty()
    id_usuario: number;
 
}