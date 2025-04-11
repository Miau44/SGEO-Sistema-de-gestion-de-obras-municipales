import { ApiProperty } from "@nestjs/swagger";
export class copiarItemDto {

    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_modificacion_pago: number;

    @ApiProperty()
    id_usuario_registro: number;

}