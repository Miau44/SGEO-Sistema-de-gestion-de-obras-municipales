

import { ApiProperty } from '@nestjs/swagger';

export class ComputoImportarDto {
    @ApiProperty()
    id_modificacion_pago: number;

    @ApiProperty()
    id_tipo_computo: number;    

    @ApiProperty()
    id_usuario: number;
 
}