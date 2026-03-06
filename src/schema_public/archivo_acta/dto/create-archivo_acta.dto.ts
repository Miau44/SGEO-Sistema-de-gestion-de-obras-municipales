import {IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, Min, Max,} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArchivoActaDto {

  @ApiProperty({
    example: 0,
    description: 'ID del informe',
  })
  @IsNumber()
  @IsNotEmpty()
  id_informe: number;

  @ApiPropertyOptional({
    example: 1,
    description: '1 = Ingreso, 2 = Salida Supervisor , 3 = Salida Empresa',
  })
  @IsNumber()
  @Min(1)
  @Max(3)
  @IsOptional()
  id_tipo_recepcion?: number;

  @ApiPropertyOptional({
    example: 'Juan Pérez',
  })
  @IsString()
  @IsOptional()
  nombre_encargado?: string;

  @ApiPropertyOptional({
    example: '10:30',
  })
  @IsString()
  @IsOptional()
  hora_registro?: string;

  @ApiPropertyOptional({
    example: 15,
  })
  @IsNumber()
  @IsOptional()
  numero_fojas?: number;

  @ApiPropertyOptional({
    example: 'Carlos López',
  })
  @IsString()
  @IsOptional()
  nombre_fiscal?: string;

  @ApiPropertyOptional({
    example: 8456123,
  })
  @IsNumber()
  @IsOptional()
  ci_encargado?: number;

  @ApiPropertyOptional({
    example: 'Recepción conforme',
  })
  @IsString()
  @IsOptional()
  observacion?: string;

  @ApiPropertyOptional({
    example: 7,
  })
  @IsNumber()
  @IsOptional()
  id_documento?: number;

  @ApiPropertyOptional({
    example: '2026-02-23',
    description: 'Fecha en formato YYYY-MM-DD',
  })
  @IsDateString()
  @IsOptional()
  fecha_entrega_dfo?: string;

  @ApiProperty({
    example: 3,
    description: 'Usuario que registra',
  })
  @IsNumber()
  @IsNotEmpty()
  id_usuario: number;
}
