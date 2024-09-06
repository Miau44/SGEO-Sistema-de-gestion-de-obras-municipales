
import { ApiProperty } from "@nestjs/swagger";
export class CreateTransicionDto {
    
    @ApiProperty()
    descripcion: string;

    @ApiProperty()
    id_tarea_origen: number;       
    
    @ApiProperty()
    id_tarea_destino: number;
    
    @ApiProperty()
    funcion_externa: string;    

    @ApiProperty()
    id_flujo: number;
   
    @ApiProperty()
    usuario_registro: number;  

    @ApiProperty()
    id_estado: number;

}
