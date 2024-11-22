import { ApiProperty } from "@nestjs/swagger";

export class GenerarSolicitudDto {
  
    @ApiProperty()
    id_tipo_solicitud: number;
      
    @ApiProperty()
    id_estado_solicitud: number;  

    @ApiProperty()
    id_obra: number;   
                
    @ApiProperty()
    id_estado_general: number;    
    
    @ApiProperty()
    usuario_registro: number;
    
   
    @ApiProperty()
    desccodue: number;

  
  
}
