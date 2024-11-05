import { ApiProperty } from "@nestjs/swagger";

export class MisProyectoDto {
    @ApiProperty()
    gestion:number

    @ApiProperty()
    permiso: number;

    @ApiProperty()
    id_usuario: number;    

}