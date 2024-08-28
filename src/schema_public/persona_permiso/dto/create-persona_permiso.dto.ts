import { ApiProperty } from "@nestjs/swagger";

export class CreatePersonaPermisoDto {
    @ApiProperty()
    id_persona: number;

    @ApiProperty()
    id_permiso: number;

    @ApiProperty()
    id_rol: number;


    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number;




}
