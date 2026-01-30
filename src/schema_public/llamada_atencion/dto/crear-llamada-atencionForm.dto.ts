import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CrearLlamadaAtencionFormDto {

  @ApiProperty()
  @IsInt()
  id_obra: number;

  @ApiProperty()
  @IsInt()
  id_usuario: number;

  // viene del combo (parametrica)
  @ApiProperty()
  @IsInt()
  id_subtipo_llamada: number;

  // se guardará en memo.referencia
  @ApiProperty({ example: "Por falta de letrero de obra" })
  @IsString()
  @IsNotEmpty()
  referencia: string;

  // se guardará en memo.descripcion
  @ApiProperty({ example: "Detalle de la llamada de atención..." })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  // textarea (solo si es "Otros motivos")
  @ApiProperty({ required: false })
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
}
