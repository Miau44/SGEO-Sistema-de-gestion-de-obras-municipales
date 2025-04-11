import { ApiProperty } from "@nestjs/swagger";

export class UsuarioDto {

    @ApiProperty({  })
    usuario!: number;

    @ApiProperty({ })
    password!: number;


}
