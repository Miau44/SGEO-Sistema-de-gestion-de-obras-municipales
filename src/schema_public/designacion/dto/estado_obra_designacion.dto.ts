import { ApiProperty } from "@nestjs/swagger";

export class EstadoObraDesigDto {
    
    @ApiProperty()
    estado_designacion: number;

    @ApiProperty()
    id_obra: number;    

    @ApiProperty()
    estado_general: number;
}