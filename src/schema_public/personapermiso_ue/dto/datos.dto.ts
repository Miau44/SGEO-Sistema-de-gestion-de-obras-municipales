import { ApiProperty } from "@nestjs/swagger";

export class PermisoXUeDto {

    @ApiProperty({ default: 0 })
    gestion: number;

    @ApiProperty()
    usuario: string;

}
