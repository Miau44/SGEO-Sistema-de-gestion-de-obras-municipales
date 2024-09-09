import { ApiProperty } from "@nestjs/swagger";

export class CreateDesignacionDto {
    @ApiProperty()
    id_tipo_solicitud: number;

    @ApiProperty()
    id_ficha:number

    @ApiProperty()
    id_persona: number;

    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    correlativo_memo: number;

    @ApiProperty()
    id_correlativo_memo: number;

    @ApiProperty()
    fecha_baja: Date;

    @ApiProperty()
    fecha_efectiva: Date;
    
    @ApiProperty()
    justificacion_baja: string;

    @ApiProperty()
    estado_designacion: number;

   /* @ApiProperty()
    id_reemplazzo: number;
        
    @ApiProperty()
    fecha_reemplazo: Date;  */  
        
    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number
}
