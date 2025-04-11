import { ApiProperty } from "@nestjs/swagger";

export class CarpetaDto {

    @ApiProperty({ default:0 })
    cod_carpeta!: number;

}
