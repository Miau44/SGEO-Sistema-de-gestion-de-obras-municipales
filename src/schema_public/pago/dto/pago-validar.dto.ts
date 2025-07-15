import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';

export class ValidarPagoDto {
    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_modificacion_pago: number;

    @ApiProperty()
    id_solicitud: number;  
    
    @ApiProperty()
    nro_pago: number;      

    @ApiProperty()
    id_usuario: number;
    
}