import { ApiProperty } from "@nestjs/swagger";
export class CreateTareaDto {
    
    @ApiProperty()
    id_flujo: number;

    @ApiProperty()
    nro_tarea: number;       

    @ApiProperty()
    descripcion_tarea: string;
    
    @ApiProperty()
    id_tipo_tarea: number;

    @ApiProperty()
    tiempo_cumplimiento: number;
    
    @ApiProperty()
    usuario_registro: number;  

    @ApiProperty()
    id_estado: number;

}
