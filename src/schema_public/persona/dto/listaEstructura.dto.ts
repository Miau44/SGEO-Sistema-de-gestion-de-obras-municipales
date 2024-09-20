import { ApiProperty } from "@nestjs/swagger";

export class ListaEstructuraDto {

  
    @ApiProperty()
    gestion: number;

    @ApiProperty()
    usuario: string;
  
}
