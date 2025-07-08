import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class VistaListadoDocsObraDto {
  @ApiProperty({})
  @IsNumber()
  id_obra: number;
}