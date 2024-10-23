
import { ApiProperty } from "@nestjs/swagger";
export class AvanzarDto {
    
    @ApiProperty()
    id_ins_flujo: number;

    @ApiProperty()
    id_tarea_actual:number;

    @ApiProperty()
    observacion:number;

    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    es_rechazo: boolean;


    @ApiProperty()
    condicion: boolean;    
}
