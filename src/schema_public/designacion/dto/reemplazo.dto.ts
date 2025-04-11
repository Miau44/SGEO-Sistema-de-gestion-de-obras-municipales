import { ApiProperty } from "@nestjs/swagger";

export class ReemplazoDto {
    
    @ApiProperty()
    id_reemplazo: number;

    @ApiProperty()
    fecha_reemplazo: Date;    
   
}