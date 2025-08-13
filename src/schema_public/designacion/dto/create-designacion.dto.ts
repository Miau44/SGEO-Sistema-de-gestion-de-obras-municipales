import { ApiProperty } from "@nestjs/swagger";

export class CreateDesignacionDto {
    @ApiProperty()
    id_tipo_solicitud: number;

    @ApiProperty()
    id_persona: number;

    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_solicitud: number;    


    @ApiProperty()
    fecha_baja: Date;

    @ApiProperty()
    fecha_efectiva: Date;
    
    @ApiProperty()
    justificacion_baja: string;

    @ApiProperty()
    estado_designacion: number;

    @ApiProperty()
    id_reemplazo: number;
        
    @ApiProperty()
    fecha_reemplazo: Date;   

    @ApiProperty()
    id_cite_memo: number;   
    @ApiProperty()
    correlativo: number;   


    @ApiProperty()
    id_cite_solicitud: number;   

    @ApiProperty()
    correlativo_solicitud: number;   

    
    @ApiProperty()
    fecha_aprobacion: Date;    
        
    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number

    @ApiProperty()
    a_nombre: string

    @ApiProperty()
    nombre_aprobador: string

    @ApiProperty()
    cargo_aprobador: string
}
