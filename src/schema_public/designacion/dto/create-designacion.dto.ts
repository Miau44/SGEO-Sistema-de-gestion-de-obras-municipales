import { ApiProperty } from "@nestjs/swagger";
export class CreateDesignacionDto {
    @ApiProperty()
    id_tipo_solicitud: number;

    @ApiProperty()
    id_persona: number;

    @ApiProperty()
    id_ficha: number;

    @ApiProperty()
    correlativo:number;
    
    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number;
    

}
