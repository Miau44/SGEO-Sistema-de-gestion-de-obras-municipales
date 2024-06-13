
import { ApiProperty } from "@nestjs/swagger";
export class CreateAsignacionDto {


    @ApiProperty()
    descripcion!: string;

    @ApiProperty()
    usuarioRegistro!: number;

    @ApiProperty()
    gestionCorrelativo!: number;

    @ApiProperty()
    idEstado!: number;



   
}

