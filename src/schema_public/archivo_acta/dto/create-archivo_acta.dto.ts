import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArchivoActaDto {

  @ApiProperty({
  example: 21,
  description: 'ID de la obra asociada',})
  @IsNumber()
  @IsNotEmpty()
  id_obra: number;

  @ApiProperty({
    example: 10,
    description: 'ID del informe asociado',
  })
  @IsNumber()
  @IsNotEmpty()
  id_informe: number;

  @ApiPropertyOptional({
    example: 1,
    description: '1 = Ingreso, 2 = Salida Fiscal, 3 = Salida Empresa , 4 = Legajo modificaciones ingreso, 5 = Legajo modificaciones salida, 6 = Legajos pagos ingreso, 7 = Legajos pagos salida ',
  })
  @IsNumber()
  @Min(1)
  @Max(7)
  @IsOptional()
  id_tipo_recepcion?: number;

  @ApiPropertyOptional({
    example: 25,
    description: 'ID del documento (solo para salidas)',
  })
  @IsNumber()
  @IsOptional()
  id_documento?: number;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsString()
  @IsOptional()
  nombre_encargado?: string;

  @ApiPropertyOptional({ example: '10:30' })
  @IsString()
  @IsOptional()
  hora_registro?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsOptional()
  numero_fojas?: number;

  @ApiPropertyOptional({
    example: 'Carlos López',
    description: 'Solo para salida fiscal',
  })
  @IsString()
  @IsOptional()
  nombre_responsable?: string;

  @ApiPropertyOptional({ example: 'CC467 '})
  @IsString()
  @IsOptional()
  hoja_ruta?: string;

  @ApiPropertyOptional({ example: 'Recepción conforme' })
  @IsString()
  @IsOptional()
  observacion?: string;

  @ApiPropertyOptional({
    example: '2026-02-23',
    description: 'Fecha de entrega (solo salidas)',
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
  
  @ApiPropertyOptional({example: 3496,
    description: 'ID de solicitud asociada, usado para legajos de modificación/pago',})
  @IsNumber()
  @IsOptional()
  id_solicitud?: number;
}