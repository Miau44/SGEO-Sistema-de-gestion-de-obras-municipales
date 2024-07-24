import { ApiProperty } from "@nestjs/swagger";

export class EstructuraFichaDto {

  /*  @ApiProperty({ default:0 })
    desc_cod_ue: number;*/

    @ApiProperty({ default:0 })
    gestion: number;    

}
