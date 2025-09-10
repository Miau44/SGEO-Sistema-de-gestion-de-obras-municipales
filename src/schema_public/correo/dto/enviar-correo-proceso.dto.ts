
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

// const toArray = (v: any) => (v == null ? [] : Array.isArray(v) ? v : [v]);

function toEmailArray(value: any, domain = '@lapaz.bo'): string[] {
  if (value == null) return [];
  const arr = Array.isArray(value) ? value : [value];
  const tokens = arr
    .flatMap(v => String(v).split(/[,\s;]+/)) // split por coma/espacio/;
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .map(s => (s.includes('@') ? s : s + domain));
  // quita duplicados
  return [...new Set(tokens)];
}

export class EnviarCorreoProcesoDto {
  
  @ApiProperty({
    example: ['example.sgeo', 'example.sgeo'],
   description: 'Destinatarios (usernames o emails)',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  para: string[];

  @ApiProperty({
    example: ['example.sgeo', 'example.sgeo'],
    description: 'CC (usernames o emails) — el primero será CC real; el resto se envían como copia individual.',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  autor?: string[];

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
