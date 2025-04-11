import { ApiProperty } from "@nestjs/swagger";

export class EstructuraObraDto {

    @ApiProperty({ default:0 })
    cod_ue: number;

}
