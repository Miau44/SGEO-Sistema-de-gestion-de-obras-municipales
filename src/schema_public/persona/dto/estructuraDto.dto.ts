import { ApiProperty } from "@nestjs/swagger";

export class EstructuraDto {

    @ApiProperty()
    idrol!: string;    

    @ApiProperty()
    codigoue!: string;

    @ApiProperty()
    gestion!: string;


}
