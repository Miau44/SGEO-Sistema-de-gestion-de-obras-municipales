import { ApiProperty } from "@nestjs/swagger";
export class PlanillaItemDto {


    @ApiProperty()
    id_modificacion_pago: number;

    @ApiProperty()
    id_item: number;

    @ApiProperty()
    id_solicitud_historial: number;    

}