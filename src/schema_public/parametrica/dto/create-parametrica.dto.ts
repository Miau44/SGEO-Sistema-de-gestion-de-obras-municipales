import { ApiProperty } from "@nestjs/swagger";
export class CreateParametricaDto {
    @ApiProperty()
    id_tipo!: number;

    @ApiProperty()
    id_subtipo!: number;

    @ApiProperty()
    descripcion!: string;

    @ApiProperty()
    id_padre!: number;

    @ApiProperty()
    usuario_registro!: number;
    
    @ApiProperty()
    id_estado!: number;



}
