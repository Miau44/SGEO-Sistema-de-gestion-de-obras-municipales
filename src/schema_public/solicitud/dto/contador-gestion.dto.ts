import { ApiProperty } from "@nestjs/swagger";

export class ContadorGestionDto {
    
    @ApiProperty()
    gestion:number

    @ApiProperty()
    usuario:number


}