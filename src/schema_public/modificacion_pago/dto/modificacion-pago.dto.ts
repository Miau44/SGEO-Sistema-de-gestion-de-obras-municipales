import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';

export class ActualizarModPagoDto {
    @ApiProperty({ required: false })
    id_modificacion_pago: number;



    
}