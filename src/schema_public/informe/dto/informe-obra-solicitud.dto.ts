import { ApiProperty, ApiPropertyOptional  } from "@nestjs/swagger";


export class InformeObraSolicitudDto {
    @ApiProperty()
    obra: number;  

    @ApiProperty()
    tipo_informe: number;  

    @ApiProperty()
    solicitud: number;  


}
