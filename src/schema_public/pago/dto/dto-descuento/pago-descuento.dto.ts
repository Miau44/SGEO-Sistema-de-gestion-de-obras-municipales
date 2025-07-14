import { ApiProperty } from "@nestjs/swagger";

export class PagoDescuentoDto {

    @ApiProperty()
    id_pago: number;      
}