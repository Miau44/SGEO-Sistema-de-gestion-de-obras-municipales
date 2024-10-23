import { ApiProperty } from "@nestjs/swagger";

export class UsuarioPermisoXUeDto {

    @ApiProperty()
    id_permiso: number;

    @ApiProperty()
    desc_cod_ue: number;

}
