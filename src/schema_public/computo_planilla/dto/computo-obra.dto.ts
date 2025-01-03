

import { ApiProperty } from '@nestjs/swagger';

export class ComputoObra {
    @ApiProperty({ required: false })
    id_obra: number;
}