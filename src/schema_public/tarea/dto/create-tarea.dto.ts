import { ApiProperty } from "@nestjs/swagger";
export class CreateTareaDto {
    
    @ApiProperty()
    id_flujo: number;

    @ApiProperty()
    nro_tarea_flujo: number;       

    @ApiProperty()
    descripcion: string;
    
    @ApiProperty()
    id_tipo_tarea: number;

    @ApiProperty()
    tiempo_cumplimiento: number;
    
    @ApiProperty()
    usuario_registro: number;  

    @ApiProperty()
    id_estado: number;

}
