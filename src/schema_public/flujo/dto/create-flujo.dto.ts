import { ApiProperty } from "@nestjs/swagger";
export class CreateFlujoDto {

    
    @ApiProperty()
    descripcion: string;

    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number;
}
