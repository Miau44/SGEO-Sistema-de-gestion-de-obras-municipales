
import { ApiProperty } from "@nestjs/swagger";

export class UsuarioDto {

      @ApiProperty()
      usuario: string;
      
      @ApiProperty()
      gestion: number;
        
  
  }
  