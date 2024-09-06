import { ApiProperty } from "@nestjs/swagger";

export class TodaslasUesDto {

    @ApiProperty()
    gestion: number;

    @ApiProperty()
    id_persona_permiso: number;
    
    @ApiProperty()
    usuario_registro: number;
    
    @ApiProperty()
    id_estado: number;
    
}