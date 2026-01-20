// dto/buscar-subtipo-parametrica.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class BuscarSubtipoParametricaDto {
  @ApiProperty({ example: 44, description: 'ID del tipo (ej: TIPO LLAMADA DE ATENCIÓN)' })
  @IsInt()
  id_tipo: number;

  @ApiProperty({ example: 375, description: 'ID del subtipo seleccionado' })
  @IsInt()
  id_subtipo: number;
}
