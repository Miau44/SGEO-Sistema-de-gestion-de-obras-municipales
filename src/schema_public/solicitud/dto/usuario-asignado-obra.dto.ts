import { ApiProperty } from "@nestjs/swagger";

export class UsuarioSolicitudObraDto {
  
    @ApiProperty()
    obra: number;   
                
   /* @ApiProperty()
    permiso: number;   */ 

    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    permiso: number[];
  
}
