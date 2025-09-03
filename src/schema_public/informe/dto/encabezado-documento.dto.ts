import { ApiProperty } from '@nestjs/swagger';

export class EncabezadoDocumentoDto {
  @ApiProperty()
  id_tipo_documento: number;

  @ApiProperty()
  id_obra: number;  

}