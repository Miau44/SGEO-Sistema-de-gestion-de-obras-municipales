import { IsInt, IsOptional, IsDecimal, IsDateString, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContratoDto {
  @ApiProperty({ example: 1, description: 'ID de la carpeta' })
  @IsOptional()
  @IsInt()
  correlativo_carpeta?: number;

  @ApiProperty({ example: 2, description: 'ID del proveedor' })
  @IsOptional()
  @IsInt()
  id_proveedor?: number;

  @ApiProperty({ example: 2, description: 'ID del proveedor' })
  @IsOptional()
  @IsInt()
  cuce?: string;

  @ApiProperty({ example: 'EMA-87-2024', description: 'cod_carpeta' })
  @IsString()
  cod_carpeta: string;


  @IsOptional()
  @IsInt()
  id_obra?:number;

  // @IsOptional()
  // @IsInt()
  // id_ficha?:number;

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

  @ApiProperty({ example: '', description: 'Modalidad del contrato' })
  @IsString()
  modalidad?: string;

  @ApiProperty({ example: '', description: 'Razon social' })
  @IsString()
  proponente_razon_social: string;

  @ApiProperty({ example: 1, description: 'ID del tipo de contrato' })
  @IsInt()
  proponente_representante: string;

  @ApiProperty({ example: '', description: 'NIT' })
  @IsString()
  proponente_nit: string;

  @ApiProperty({ example: '2024-11-11', description: 'ID del tipo de contrato' })
  @IsDateString()
  fecha_numeracion: Date;

  @ApiProperty({ example: '2024-11-11', description: 'ID del tipo de contrato' })
  @IsDateString()
  fecha_contrato: Date;

  @ApiProperty({ example: '', description: '' })
  @IsString()
  direccion: string;

  @ApiProperty({ example: '', description: '' })
  @IsString()
  telefono: string;

  @ApiProperty({ example: 1, description: 'ID del contrato' })
  @IsInt()
  id_contrato: number;
}