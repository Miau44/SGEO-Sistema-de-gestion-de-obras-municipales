import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateLlamadaAtencionDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  id_llamada_atencion: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  id_usuario: number;

  // (si permitís cambiar el combo)
  @ApiProperty()
  @IsOptional()
  @IsInt()
  id_subtipo_llamada?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  desc_subtipo_llamada?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  referencia_otro?: string;

  // llamadas de atencion
  @ApiProperty()
  @IsOptional()
  @IsDateString()
  fecha_instruccion?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  fecha_cumplimiento_instruccion?: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  libro_ordenes_obra?: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  hoja_nro?: number;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  fecha_maxima_cumplimiento_memo?: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  id_estado_llamada_atencion?: number;

}
