

import { ApiProperty } from '@nestjs/swagger';

export class ComputoImportarDto {
    @ApiProperty({ required: false })
    id_modificacion: number;

    @ApiProperty({ required: false })
    id_tipo_computo: number;    

    @ApiProperty({ required: false })
    id_usuario: number;
 
}