import { ApiProperty, ApiPropertyOptional  } from "@nestjs/swagger";


export class ListaInformeDto {
    @ApiProperty()
    padre: number;  

    @ApiProperty({default:0})
    informe: number;      

}
