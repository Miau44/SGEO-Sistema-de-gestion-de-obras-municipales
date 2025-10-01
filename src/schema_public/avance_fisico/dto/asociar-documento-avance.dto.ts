import { ApiProperty } from '@nestjs/swagger';

export class AsociarDocumentoAvanceDto {
  @ApiProperty({ example: 1455 })
  id_documento: number;
}
