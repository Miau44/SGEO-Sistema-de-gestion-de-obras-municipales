import { ApiProperty } from "@nestjs/swagger";

export class CreateLogDto {
@ApiProperty()
  id_usuario: number;

  @ApiProperty()
  parametro: string;

  @ApiProperty()
  mensaje: string;

  @ApiProperty()
  funcionalidad: string;

  @ApiProperty()
  respuesta: string;
}
