import { ApiProperty } from "@nestjs/swagger";


export class MemorandumObraDto {
    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_tipo_memo: number;

}
