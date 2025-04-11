import { ApiProperty } from "@nestjs/swagger";

export class LoginExternoDto {
    @ApiProperty()
    usuario: string;

    @ApiProperty()
    clave: string;
}