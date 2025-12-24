import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLlamadaAtencionDto {
  
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  id_obra: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  id_memo: number;

  @ApiProperty({ required: false, example: '2025-12-10' })
  @IsOptional()
  @IsDateString()
  fecha_instruccion?: string;

  @ApiProperty({ required: false, example: '2025-12-15' })
  @IsOptional()
  @IsDateString()
  fecha_cumplimiento_instruccion?: string;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @IsInt()
  libro_ordenes_obra?: number;

  @ApiProperty({ required: false, example: 12 })
  @IsOptional()
  @IsInt()
  hoja_nro?: number;

  @ApiProperty({ required: false, example: '2025-12-20' })
  @IsOptional()
  @IsDateString()
  fecha_maxima_cumplimiento_memo?: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  id_usuario: number;

}
