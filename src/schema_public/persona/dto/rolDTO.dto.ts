
import { ApiProperty } from '@nestjs/swagger';

export class RolDto {
 


  @ApiProperty()
  id_rol: any

  @ApiProperty({ type: Number, description: 'valor de gestion' })
  gestion: number;

  @ApiProperty()
  desc_cod_ue: number

}
