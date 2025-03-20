import { ApiProperty } from "@nestjs/swagger";
export class FinalizarPlanillaDto {

    @ApiProperty()
    id_modificacion_pago: number;

}