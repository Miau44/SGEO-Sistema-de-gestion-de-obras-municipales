import { ApiProperty } from "@nestjs/swagger";

export class CreatePersonaPermiso2Dto {
    @ApiProperty()
    id_persona: number;

    @ApiProperty()
    id_permiso: number;

    @ApiProperty()
    id_rol: number;


    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    puesto:string;

    @ApiProperty()
    id_estado: number;




}
