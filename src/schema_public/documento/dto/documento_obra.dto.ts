import { ApiProperty, ApiPropertyOptional  } from "@nestjs/swagger";

export class DocumentoObraDto {
      @ApiProperty()
      obra: number;  

      @ApiProperty({ description: 'Estado de ', required: false })
      anticipo?: boolean;
    
   

   



  
  }
  