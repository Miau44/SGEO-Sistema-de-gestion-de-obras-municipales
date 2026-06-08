import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class ReporteGeneralDto {
    
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    correlativo_carpeta: number;
    
}