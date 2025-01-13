import { ApiProperty } from "@nestjs/swagger";
export class CreatePlanillaDto {


    @ApiProperty()
    id_modificacion: number;

    @ApiProperty()
    id_tipo_planilla: number;    

    @ApiProperty()
    id_item: number; 

    @ApiProperty()
    area_total: number;       

}