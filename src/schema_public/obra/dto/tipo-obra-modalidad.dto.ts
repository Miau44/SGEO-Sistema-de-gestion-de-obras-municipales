import { ApiProperty } from "@nestjs/swagger";

export class TipoObraModObraDto {
    
    @ApiProperty()
    id_tipo_obra: number;

    @ApiProperty()
    id_modalidad: number;
}