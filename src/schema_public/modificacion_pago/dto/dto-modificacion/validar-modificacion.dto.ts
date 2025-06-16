import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';

export class ValidarModificacionDto {
    @ApiProperty({required: false})
    id_obra: number;


    @ApiProperty()
    id_modificacion_pago: number;

    @ApiProperty()
    id_tipo_modificacion: number;

    @ApiProperty()
    id_solicitud: number;    

    id_usuario: number;
    
}