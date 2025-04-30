import { ApiProperty } from "@nestjs/swagger";

export class UsuarioSolicitudXObraDto {
  
    @ApiProperty()
    id_obra: number;   
                
    @ApiProperty()
    estado_general: number;    
  
}
