import { ApiProperty } from '@nestjs/swagger';

export class EncabezadoDocumentoMemoDto {
  @ApiProperty()
  id_tipo_memo: number;

  @ApiProperty()
  id_obra: number;


  @ApiProperty({ required: false })
  id_memo: number;

  /*@ApiProperty({required: false})
  id_correlativo: number;*/

}