    import { ApiProperty, ApiPropertyOptional  } from "@nestjs/swagger";
    
    
    export class ListaInformeObraDto {
        // @ApiProperty()
        // id_informe: number;  
    
        @ApiProperty({default:0})
        id_obra: number; 
        
         @ApiProperty({ example: 295 })
        id_subtipo_cite: number;
    
    }
    