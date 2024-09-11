
import { ApiProperty } from '@nestjs/swagger';

export class ListaDocumentoDto {
  
  @ApiProperty()
  id_obra: number


  @ApiProperty()
  id_tipo_documento: number

}
