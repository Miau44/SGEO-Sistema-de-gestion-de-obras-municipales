import { ApiProperty } from "@nestjs/swagger";

export class MaxCorrelativoDto {
    @ApiProperty()
    id_obra:number

    @ApiProperty()
    id_permiso: number;

}