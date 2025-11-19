
import { ApiProperty } from '@nestjs/swagger';


export class FiltroFechasModificacionDto {
  @ApiProperty({ example: 123, description: 'ID de obra' })
  id_obra: number;

  @ApiProperty({ example: 45, description: 'ID modificación' })
  id_modificacion?: number;
}
