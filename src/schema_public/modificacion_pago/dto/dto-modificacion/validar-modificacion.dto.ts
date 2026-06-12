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

    @ApiProperty()
    id_usuario: number;

    @ApiProperty()
    antecedentes?: string;

    @ApiProperty()
    analisis?: string;
    
    @ApiProperty()
    conclusion?: string;

    @ApiProperty()
    recomendacion?: string;
    
}