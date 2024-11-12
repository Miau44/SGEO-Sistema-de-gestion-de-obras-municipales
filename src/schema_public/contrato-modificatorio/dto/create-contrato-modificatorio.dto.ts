import { IsInt, IsOptional, IsDecimal, IsDateString, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContratoModificatorioDto {
  @ApiProperty({ example: 1, description: 'ID de la carpeta' })
  @IsOptional()
  @IsInt()
  id_carpeta?: number;

  @ApiProperty({ example: 2, description: 'ID del proveedor' })
  @IsOptional()
  @IsInt()
  id_proveedor?: number;

  @ApiProperty({ example: 10000.50, description: 'Monto del contrato' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  contrato_monto?: number;

  @ApiProperty({ example: '2024-11-11', description: 'Fecha del contrato' })
  @IsOptional()
  @IsDateString()
  contrato_fecha?: Date;

  @ApiProperty({ example: 'Juan', description: 'Nombre del RPA' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre_rpa?: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido paterno del RPA' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido_p_rpa?: string;

  @ApiProperty({ example: 'Gómez', description: 'Apellido materno del RPA' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido_m_rpa?: string;

  @ApiProperty({ example: 'SIM123', description: 'Código de la carpeta SIM' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pmc_cod_carp_sim?: string;

  @ApiProperty({ example: 'RPA001', description: 'RPA asignado' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  rpa?: string;

  @ApiProperty({ example: 'CNTR-001', description: 'Número del contrato' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contrato_numero?: string;

  @ApiProperty({ example: 1, description: 'ID del tipo de contrato' })
  @IsInt()
  id_tipo_contrato: number;
}
