import { ApiProperty } from "@nestjs/swagger";
export class actualizarJustificacionDto {

    
    @ApiProperty()
    id_modificacion_pago: number;

    @ApiProperty()
    id_item: number;

    @ApiProperty()
    justificacion_supervisor: string;

    @ApiProperty()
    id_usuario_registro: number;

}