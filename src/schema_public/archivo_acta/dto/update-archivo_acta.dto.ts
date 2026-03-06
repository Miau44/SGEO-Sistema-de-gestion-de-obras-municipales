import { IsNumber, IsString, IsOptional, IsDateString, Min, Max, } from 'class-validator';
export class UpdateArchivoActaDto {
  // 1 = Ingreso, 2 = Salida
  @IsNumber()
  @Min(1)
  @Max(2)
  @IsOptional()
  id_tipo_recepcion?: number;

  @IsString()
  @IsOptional()
  nombre_encargado?: string;

  @IsString()
  @IsOptional()
  hora_registro?: string;

  @IsNumber()
  @IsOptional()
  numero_fojas?: number;

  @IsString()
  @IsOptional()
  nombre_fiscal?: string;

  @IsNumber()
  @IsOptional()
  ci_encargado?: number;

  @IsString()
  @IsOptional()
  observacion?: string;

  @IsNumber()
  @IsOptional()
  id_documento?: number;

  @IsDateString()
  @IsOptional()
  fecha_entrega_dfo?: string;

  @IsNumber()
  @IsOptional()
  id_usuario?: number;
}