import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateGarantiaSeguroDto {

  @ApiProperty()
  @IsInt()
  id_obra: number;

  @ApiProperty()
  @IsString()
  tipo_accion: string;

  @ApiProperty()
  @IsInt()
  id_tipo_documento: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  id_tipo_garantia?: number;

  @ApiProperty()
  @IsString()
  entidad_emisora: string;

  @ApiProperty()
  @IsDate()
  inicio_vigencia: Date;

  @ApiProperty()
  @IsDate()
  fin_vigencia: Date;

  @ApiProperty()
  @IsNumber()
  monto: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  id_documento?: number;

  @ApiProperty()
  @IsInt()
  id_estado: number;

  @ApiProperty()
  @IsInt()
  id_usuario: number;

}
