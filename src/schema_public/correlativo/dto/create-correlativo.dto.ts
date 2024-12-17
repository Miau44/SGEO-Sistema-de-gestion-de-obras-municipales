
import { ApiProperty } from "@nestjs/swagger";
export class CreateCorrelativoDto {
    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_tipo_documento: number;

    @ApiProperty()
    correlativo: string;
    
    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number;    
}