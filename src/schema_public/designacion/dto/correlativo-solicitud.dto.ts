import { ApiProperty } from "@nestjs/swagger";


export class MaxCorrelativoSolicitudDto {
    @ApiProperty()
    id_obra:number

    @ApiProperty()
    id_permiso: number;

    @ApiProperty()
    id_cite_solicitud: number;
}