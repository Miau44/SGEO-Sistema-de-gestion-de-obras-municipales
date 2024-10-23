import { ApiProperty } from "@nestjs/swagger";

export class CreateInstanciaTareaDto {

    @ApiProperty()
    id_tarea: number;

    @ApiProperty()
    id_ins_flujo: number;

    @ApiProperty()
    fecha_inicio: Date;

    @ApiProperty({nullable:true})
    fecha_fin: Date;

    @ApiProperty()
    finalizado: boolean;  
    
    @ApiProperty()
    observacion:string;

    @ApiProperty({nullable:true})
    id_inst_tarea_anterior:number;

    @ApiProperty()
    usuario_registro:number;


}
