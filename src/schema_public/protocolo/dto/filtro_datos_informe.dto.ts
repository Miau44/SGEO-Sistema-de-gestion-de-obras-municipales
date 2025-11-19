import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FiltroDatosInformeDto {
  @ApiProperty({ example: 123, description: 'ID de la obra' })
  @Type(() => Number)
  id_obra: number;

  @ApiProperty({ example: 456, description: 'ID del informe' })
  @Type(() => Number)
  id_informe: number;
}
