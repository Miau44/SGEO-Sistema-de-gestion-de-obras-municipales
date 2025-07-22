import { ApiProperty } from '@nestjs/swagger';

export class UpdateIdDocumentoPagoDto {


    @ApiProperty()
    id_informe: number;

  @ApiProperty({
   
      type: 'object',
     

  })
  id_documento: { id_documento: string }[];
}

