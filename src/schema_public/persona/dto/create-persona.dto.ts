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
    profesion!: string;

    @ApiProperty()
    abreviatura!: string;

    @ApiProperty()
    fecha_aprobacion!: Date;

    @ApiProperty()
    usuario_registro!: string;


    @ApiProperty()
    id_estado!: number;

    
}
  