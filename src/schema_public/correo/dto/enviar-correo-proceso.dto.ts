
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EnviarCorreoProcesoDto {
  @IsEmail()
  para: string[];

  @IsNotEmpty()
  codigoObra: string; // Ej: OBN-XXX-2025

  @IsNotEmpty()
  nombreObra: string;

  @IsNotEmpty()
  actividad: string;

  @IsNotEmpty()
  proveido: string;
}
