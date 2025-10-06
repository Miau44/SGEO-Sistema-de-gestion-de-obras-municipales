import { ApiProperty } from '@nestjs/swagger';

export class EncabezadoDocumentoDto {
  @ApiProperty()
  id_tipo_documento: number;

  @ApiProperty()
  id_obra: number;  


  @ApiProperty({required: false})
  id_informe: number;

  @ApiProperty({required: false})
  id_solicitud: number;

}