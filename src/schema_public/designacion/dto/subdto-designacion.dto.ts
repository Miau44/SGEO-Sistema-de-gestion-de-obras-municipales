
import { ApiProperty } from '@nestjs/swagger';

export class SubDesignacionDto {
  @ApiProperty({ description: 'ID del item', example: 1 })
  id_designacion: number;

  @ApiProperty({ description: 'Número del item', example: 2 })
  correlativo: number;
}