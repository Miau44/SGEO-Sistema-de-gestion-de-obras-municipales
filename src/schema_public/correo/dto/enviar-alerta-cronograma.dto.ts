import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class EnviarAlertaCronogramaDto {
  @ApiProperty()
  @IsNumber()
  id_obra!: number;

  @ApiProperty()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty()
  @IsNotEmpty()
  nombre!: string;

  @ApiPropertyOptional()
  @IsOptional()
  unidad_ejecutora?: string;

  @ApiPropertyOptional()
  @IsOptional()
  estado_carpeta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  numero_contrato?: string;

  @ApiPropertyOptional()
  @IsOptional()
  contratista?: string;

  @ApiPropertyOptional()
  @IsOptional()
  usuario_supervisor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  supervisor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  usuario_fiscal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  fiscal?: string;

  @ApiProperty()
  @IsNotEmpty()
  fecha_control!: string;

  @ApiProperty()
  @IsNotEmpty()
  etapa!: string;

  @ApiProperty()
  @IsNumber()
  dias_restantes!: number;

  @ApiProperty()
  @IsNumber()
  dias_multa!: number;

  @ApiProperty({ enum: ['AMARILLO', 'NARANJA', 'ROJO'] })
  @IsIn(['AMARILLO', 'NARANJA', 'ROJO'])
  tipo_alerta!: 'AMARILLO' | 'NARANJA' | 'ROJO';
}