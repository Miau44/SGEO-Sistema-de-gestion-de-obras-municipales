import { ApiProperty } from "@nestjs/swagger";

export class FiltrosDto {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    campo!: string;    
}