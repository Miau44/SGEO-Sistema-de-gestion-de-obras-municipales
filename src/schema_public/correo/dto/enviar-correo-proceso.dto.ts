
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EnviarCorreoProcesoDto {
  
   @ApiProperty({
    example: [
      'correo1@ejemplo.com',
      'correo2@ejemplo.com',
    ],
    description: 'Lista de correos destinatarios',
    type: [String],
  })
  @IsEmail()
  para: string[];

  @ApiProperty({ example: 'OBN-123-2025' })
  @IsNotEmpty()
  codigoObra: string; // Ej: OBN-XXX-2025

  @ApiProperty({ example: 'Construcción de puente vehicular en la Av. Mariscal' })
  @IsNotEmpty()
  nombreObra: string;

  @ApiProperty({ example: 'Aprobación de solicitud de modificación' })
  @IsNotEmpty()
  actividad: string;

  @ApiProperty({ example: 'Favor emitir informe técnico y legal.' })
  @IsNotEmpty()
  proveido: string;
}
