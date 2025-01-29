import { ApiProperty } from "@nestjs/swagger";
export class copiarItemDto {

    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_modificacion: number;

    @ApiProperty()
    id_usuario_registro: number;

}