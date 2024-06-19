import { ApiProperty } from "@nestjs/swagger";

export class CreateParametricaDto {


    @ApiProperty()
    id_tipo!: number;

    @ApiProperty()
    desc_tipo!: string;

    @ApiProperty()
    id_subtipo!: number;

    @ApiProperty()
    desc_subtipo!: string;
   

    @ApiProperty()
    detalle!: string;

    @ApiProperty()
    id_padre!: number;

    @ApiProperty()
    usuario_registro!: number;

    @ApiProperty()
    id_estado!:number;
 
}
