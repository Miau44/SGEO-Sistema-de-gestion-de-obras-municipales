import { ApiProperty } from "@nestjs/swagger";

export class UsuarioSolicitudDto {
  
    @ApiProperty()
    solicitud: number;   
                
    @ApiProperty()
    estado_general: number;    
  
}
