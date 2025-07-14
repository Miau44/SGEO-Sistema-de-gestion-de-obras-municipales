import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';

export class PagoObraDto {
    @ApiProperty()
    id_obra: number;



    
}