import { ApiProperty, ApiPropertyOptional  } from "@nestjs/swagger";


export class InformeObraDto {
    @ApiProperty()
    obra: number;  

    @ApiProperty()
    tipo_informe: number;  


}
