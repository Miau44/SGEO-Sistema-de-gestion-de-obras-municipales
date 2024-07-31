import { ApiProperty } from "@nestjs/swagger";

export class CreateSolicitudDesignacionDto {

    @ApiProperty()
    id_tipo_solicitud: number;

  /*  @ApiProperty()
    id_tipo_obra: number;

    @ApiProperty()
    id_modalidad: number;*/
    @ApiProperty()
    id_ficha:number

    @ApiProperty()
    id_persona: number;

    @ApiProperty()
    id_obra: number;
    
    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number;
    
}
