import { ApiProperty } from "@nestjs/swagger";
export class CopiarPlanillaXItemDto {

    @ApiProperty()
    id_item: number;

    @ApiProperty()
    id_modificacion_pago: number;

    @ApiProperty()
    id_usuario_registro: number;

}