
import { ApiProperty } from "@nestjs/swagger";
export class CreateComputoObservacionDto {

    @ApiProperty()
    id_computo: number;

    @ApiProperty()
    id_solicitud_historial: number;
      
    @ApiProperty()
    observacion_fiscal: string;
           
    @ApiProperty()
    id_usuario_registro: number;       

    @ApiProperty()
    id_estado: number;       
    
    

}
