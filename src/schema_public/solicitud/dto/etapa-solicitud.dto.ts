import { ApiProperty } from "@nestjs/swagger";

export class EtapaSolicitudDto {
  
    @ApiProperty()
    obra: number;   
                
    @ApiProperty()
    estado_general: number;    
  
}
