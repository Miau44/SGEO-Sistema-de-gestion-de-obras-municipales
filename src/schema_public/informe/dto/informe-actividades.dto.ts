import { ApiProperty, ApiPropertyOptional  } from "@nestjs/swagger";


export class InformeActividadesDto {


    @ApiProperty({default:0})
    informe: number;      

}
