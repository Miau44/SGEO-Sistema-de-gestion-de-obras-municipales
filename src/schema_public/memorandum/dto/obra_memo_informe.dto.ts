import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString } from 'class-validator';

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
  fechaOrdenProceder: Date;

  @ApiProperty()
  fechaRecepProvisional: Date;

  @ApiProperty()
  @IsInt()
  plazoProvDefinitiva: number;

  @ApiProperty()
  fechaRecepDefinitiva: Date;

  @ApiProperty()
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

