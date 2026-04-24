import { IsNumber, IsString, IsOptional, IsDateString, Min, Max, IsBoolean , } from 'class-validator';
export class UpdateArchivoActaDto {
  // 1 = Ingreso, 2 = Salida supervisor , 3 = salida empresa 
  @IsNumber()
  @Min(1)
  @Max(3)
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
  id_documento?: number | null;

  @IsDateString()
  @IsOptional()
  fecha_entrega_dfo?: string;

  @IsNumber()
  @IsOptional()
  id_usuario?: number;

  @IsBoolean()
  @IsOptional()
  aprobado?:boolean | null;

}


