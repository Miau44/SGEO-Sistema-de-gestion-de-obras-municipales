
import { ApiProperty } from "@nestjs/swagger";
export class IniciarFlujoDto {

    
    @ApiProperty()
    id_flujo: number;

    @ApiProperty()
    id_generico: number;

    @ApiProperty()
    usuario_registro: number;
}
