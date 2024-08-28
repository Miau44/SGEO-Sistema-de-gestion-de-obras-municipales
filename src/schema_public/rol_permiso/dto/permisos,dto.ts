import { ApiProperty } from "@nestjs/swagger";
export class PermisoDto {

    @ApiProperty()
    rol: string;    

    @ApiProperty()
    usuario: string;

}
