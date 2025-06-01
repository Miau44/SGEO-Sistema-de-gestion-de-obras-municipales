import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';

export class ValidarModificacionDto {
    @ApiProperty({required: false})
    id_obra: number;


    @ApiProperty()
    id_modificacion_pago: number;



    
}