import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';

export class ActualizarModDto {
    @ApiProperty()
    id_modificacion: number;



    
}