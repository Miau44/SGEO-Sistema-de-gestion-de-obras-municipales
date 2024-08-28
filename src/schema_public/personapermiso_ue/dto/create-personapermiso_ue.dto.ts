import { ApiProperty } from "@nestjs/swagger";
export class CreatePersonapermisoUeDto {

    @ApiProperty()
    id_persona_permiso: number;

    @ApiProperty()
    desc_cod_ue: number;


    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number;


}
