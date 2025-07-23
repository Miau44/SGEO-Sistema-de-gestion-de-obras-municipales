import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';

export class UsuarioPagoDto {
    @ApiProperty()
    id_usuario: number;

    
}