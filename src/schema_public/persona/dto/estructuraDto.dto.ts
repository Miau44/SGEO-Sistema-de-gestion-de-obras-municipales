import { ApiProperty } from "@nestjs/swagger";

export class EstructuraDto {

    @ApiProperty()
    ue!: string;

    @ApiProperty()
    gestion!: string;


}
