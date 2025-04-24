import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, IsDateString, IsDate, IsOptional } from 'class-validator';

export class GuardarObraDto {

  // update tabla obra
  @ApiProperty()
  @IsInt()
  idObra: number;

  @ApiProperty()
  @IsInt()
  idTipoPago: number;

  @ApiProperty()
  @IsInt()
  numeroPago: number; // Cambiado de `numeroPagos`

  @ApiProperty()
  @IsInt()
  planillaAnticipo: number; // Cambiado de `planillasAnticipo`

  @ApiProperty()
  /*@IsOptional()
  @IsDate()
  @Type(() => Date)*/
  fechaOrdenProceder: Date ;

  @ApiProperty()
 /* @IsOptional()
  @IsDate()
  @Type(() => Date)*/
  fechaRecepProvisional: Date;

  @ApiProperty()
  /*@IsOptional()
  @IsDate()
  @Type(() => Date)*/
  plazoProvDefinitiva: number;

  @ApiProperty()
  /*@IsOptional()
  @IsDate()
  @Type(() => Date)**/
  fechaRecepDefinitiva: Date;

  @ApiProperty()
  /*@IsOptional()
  @IsDate()
  @Type(() => Date)*/
  fechaInicioEjecucion: Date; // Cambiado de `fechaInicio`

  @ApiProperty()
  @IsInt()
  plazoEjecucion: number;

  //insercion tabla memorandum

  @ApiProperty()
  @IsInt()
  idCorrelativoMemo: number;

  @ApiProperty()
  @IsString()
  nombreDestinatario: string;

  @ApiProperty()
  @IsString()
  referencia: string;

  @ApiProperty()
  @IsString()
  descripcion: string;

  @ApiProperty()
  @IsString()
  cargoRemitente: string;

  @ApiProperty()
  @IsInt()
  idUsuarioMemo: number;

  //insercion tabla informe

  @ApiProperty()
  @IsString()
  analisis: string;

  @ApiProperty()
  @IsString()
  conclusion: string;

  @ApiProperty()
  @IsString()
  recomendacion: string;

  @ApiProperty()
  @IsInt()
  idCorrelativoInforme: number;

  @ApiProperty()
  @IsInt()
  usuarioRegistroInforme: number;
}

