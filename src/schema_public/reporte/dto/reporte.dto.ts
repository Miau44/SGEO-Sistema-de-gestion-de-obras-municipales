
import { ApiProperty } from "@nestjs/swagger";

export class ReporteDto {
      
    @ApiProperty()
    gestion: number;

    @ApiProperty()
    id_designacion: number;


}