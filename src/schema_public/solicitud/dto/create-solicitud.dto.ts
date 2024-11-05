import { ApiProperty } from "@nestjs/swagger";

export class CreateSolicitudDto {
    
    @ApiProperty()
    id_tipo_solicitud: number;
      
    @ApiProperty()
    id_estado_solicitud: number;  

    @ApiProperty()
    id_obra: number;   
                
    @ApiProperty()
    id_estado_general: number;    
    
    @ApiProperty()
    id_usuario: number;          

    @ApiProperty()
    proveido: string;     
        
    @ApiProperty()
    usuario_registro: number;
    
    @ApiProperty()
    id_estado_registro: number;    
}
