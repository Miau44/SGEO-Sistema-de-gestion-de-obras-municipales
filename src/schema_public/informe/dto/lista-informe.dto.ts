import { ApiProperty, ApiPropertyOptional  } from "@nestjs/swagger";


export class ListaInformeDto {
    @ApiProperty()
    padre: number;  

}
