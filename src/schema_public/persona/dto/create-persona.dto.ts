import { ApiProperty } from "@nestjs/swagger";

export class CreatePersonaDto {

    @ApiProperty()
    id_usuario!: number;

    @ApiProperty()
    usuario!: string;

    @ApiProperty()
    nombre!: string;

    @ApiProperty()
    primer_apellido!: string;

    @ApiProperty()
    segundo_apellido!: string;

    @ApiProperty()
    cargo!: string;

    @ApiProperty()
    puesto!: string;

    @ApiProperty()
    id_profesion!: number;

    @ApiProperty()
    registro_profesional!: string;

    @ApiProperty()
    cod_ue!: number;    

    @ApiProperty()
    fecha_aprobacion!: Date;

    @ApiProperty()
    usuario_registro!: number;


    @ApiProperty()
    id_estado!: number;

    
}
  