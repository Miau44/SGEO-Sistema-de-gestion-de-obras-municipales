import { ApiProperty } from "@nestjs/swagger";

export class PermisoXUeDto {

    @ApiProperty({ required: false })
    gestion?: number;

    @ApiProperty()
    usuario: string;

}
