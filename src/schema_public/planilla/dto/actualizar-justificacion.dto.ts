import { ApiProperty } from "@nestjs/swagger";
export class actualizarJustificacionDto {

    @ApiProperty()
    id_item: number;

    @ApiProperty()
    justificacion: string;

    @ApiProperty()
    id_modificacion: number;

}