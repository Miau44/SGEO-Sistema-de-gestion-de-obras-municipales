
import { ApiProperty } from '@nestjs/swagger';

export class SubDesignacionDto {
  @ApiProperty({ description: 'ID de designacion', example: 0 })
  id_designacion: number;

  @ApiProperty({ description: 'Número coorelativo', example: 0 })
  correlativo: number;
}