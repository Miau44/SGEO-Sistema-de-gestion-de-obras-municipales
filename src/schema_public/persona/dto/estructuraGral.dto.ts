import { ApiProperty } from "@nestjs/swagger";

export class EstructuraGralDto {
      
    @ApiProperty()
    codigoue: string;

    @ApiProperty()
    gestion: string;


}
