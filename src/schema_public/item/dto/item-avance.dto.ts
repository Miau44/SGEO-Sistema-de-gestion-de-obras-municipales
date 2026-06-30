
import { ApiProperty } from '@nestjs/swagger';
export class AvanceItemDto{
    @ApiProperty()
    id_item: number;

    @ApiProperty()
    id_modificacion_pago: number;    


}