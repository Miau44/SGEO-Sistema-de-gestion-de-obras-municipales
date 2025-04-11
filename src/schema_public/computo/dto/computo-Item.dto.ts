import { ApiProperty } from '@nestjs/swagger';

export class ComputoItemDto{
    @ApiProperty()
    id_item: number;

    @ApiProperty()
    id_modificacion_pago: number;    


}