
import { ApiProperty } from '@nestjs/swagger';

export class RolDto {
 


  @ApiProperty()
  id_rol: any

  @ApiProperty({ type: Number, description: 'valor de gestion' })
  gestion: number;

  @ApiProperty({ type: [Number], description: 'Array de IDs' })
  desc_cod_ue: number[];

}
