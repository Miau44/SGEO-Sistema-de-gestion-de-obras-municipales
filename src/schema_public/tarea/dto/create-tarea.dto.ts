import { ApiProperty } from "@nestjs/swagger";
export class CreateTareaDto {

    @ApiProperty()
    descripcion: string;
    
    @ApiProperty()
    id_flujo: number;

}
