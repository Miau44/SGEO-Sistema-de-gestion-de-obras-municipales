import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CamposModificacionDto {
  @ApiProperty()
  @IsOptional()
  fecha_fiscal?: string;

  @ApiProperty()
  @IsOptional()
  fecha_supervisor?: string;

  @ApiProperty()
  @IsOptional()
  fecha_memo_minuta?: string;

  @ApiProperty()
  @IsOptional()
  dias_variacion?: number;
  
}

class CamposInformeDto {
  @ApiProperty()
  @IsOptional()
  referencia?: string;

  @ApiProperty()
  @IsOptional()
  antecedentes?: string;

  @ApiProperty()
  @IsOptional()
  analisis?: string;

  @ApiProperty()
  @IsOptional()
  obs_general?: string;
}

export class CrearProtocoloModificacionDto {
  @ApiProperty()
  id_obra: number;

  @ApiProperty()
  id_modificacion: number;

  @ApiProperty()
  id_informe: number;

  @ApiProperty()
  id_usuario: number;

  @ApiProperty({ description: 'Motivo o justificación del cambio realizado' })
  justificacion: string;

  @ApiPropertyOptional({ type: CamposModificacionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CamposModificacionDto)
  campos_modificacion?: CamposModificacionDto;

  @ApiPropertyOptional({ type: CamposInformeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CamposInformeDto)
  campos_informe?: CamposInformeDto;
}
