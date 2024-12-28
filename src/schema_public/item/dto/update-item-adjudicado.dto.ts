import { ApiProperty } from '@nestjs/swagger';

export class ItemAdjudicadoDto {
  @ApiProperty()
  id_item: number;

  @ApiProperty()
  p_unitario_adjudicado: number;

  @ApiProperty()
  total_adjudicado: number;

  
}


