import { ApiProperty } from "@nestjs/swagger";
export class CreateCorrelativoMemoDto {
    @ApiProperty()
    id_ficha: number;

    @ApiProperty()
    correlativo_memo: number;
    
    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number;    
}
