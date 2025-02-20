import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';

export class listaModDto {
    @ApiProperty({ required: false })
    id_obra: number;



    
}