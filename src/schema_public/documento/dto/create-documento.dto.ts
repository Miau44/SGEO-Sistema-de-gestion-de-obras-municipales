import { ApiProperty } from "@nestjs/swagger";

export class CreateDocumentoDto {

    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_tipo_documento: number;

    @ApiProperty()
    cumple: boolean;

    @ApiProperty()
    ruta_documento: string;

    @ApiProperty()
    observacion: string;    

    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number;

}
