import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNotEmpty, IsString } from "class-validator";
export class SuspensionObraDto {

    @IsInt()  
    @IsNotEmpty()  
    @ApiProperty()
    id_obra: number;   


}
