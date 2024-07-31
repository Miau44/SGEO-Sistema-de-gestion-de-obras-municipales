import { ApiProperty } from "@nestjs/swagger";

export class CreateObraDto {

@ApiProperty()
id_ficha: number;

@ApiProperty()
id_tipo_obra: number;

@ApiProperty()
id_modalidad: number;

@ApiProperty()
usuario_registro: number;

@ApiProperty()
id_estado: number;

}