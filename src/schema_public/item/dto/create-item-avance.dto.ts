import { ApiProperty } from '@nestjs/swagger';

export class CreateItemAvanceDto {
  @ApiProperty()
  id_item: number;

  @ApiProperty()
  porcentaje_avance: number;

  @ApiProperty()
  id_usuario_registro: number;

  @ApiProperty()
  id_estado: number;


}