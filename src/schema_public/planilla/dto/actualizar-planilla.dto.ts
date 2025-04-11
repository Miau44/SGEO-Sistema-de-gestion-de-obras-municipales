import { ApiProperty } from "@nestjs/swagger";
export class actualizarPlanillaDto {

    @ApiProperty()
    id_modificacion_pago: number;

    @ApiProperty({required:false})
    id_item: number;


}