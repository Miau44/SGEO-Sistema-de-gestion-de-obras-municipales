import { ApiProperty } from "@nestjs/swagger";

export class BandejaDto {
    
    @ApiProperty()
    gestion:number


    @ApiProperty()
    usuario:number

    @ApiProperty()
    estado: number;



}