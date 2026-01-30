import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';

export class ActualizarCMADto {
    
    @ApiProperty()
    id_modificacion: number;

    @ApiProperty()
    dias_variacion: number;

    @ApiProperty()
    monto_variacion: number;

    @ApiProperty()
    fecha_modificacion: Date;
    
}