
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

// const toArray = (v: any) => (v == null ? [] : Array.isArray(v) ? v : [v]);

function toEmailArray(value: any, domain = '@lapaz.bo'): string[] {
  if (value == null) return [];
  const arr = Array.isArray(value) ? value : [value];
  const tokens = arr
    .flatMap(v => String(v).split(/[,\s;|]+/))  
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .map(s => (s.includes('@') ? s : s + domain));
  return [...new Set(tokens)];
}

export class EnviarCorreoProcesoDto {
  @ApiProperty({
    description: 'Destinatarios TO (usernames o emails). Podés enviar un string (pipes/CSV/; o espacios) o un array.',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    examples: {
      pipes: 'ibrahim.aruni | maria.perez',
      csv: 'ibrahim.aruni, maria.perez',
      array: ['ibrahim.aruni', 'maria.perez'],
    },
  })
  @Transform(({ value }) => toEmailArray(value))    
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })                         
  para!: string[];                                     

  @ApiPropertyOptional({
    description: 'CC (usernames o emails). Acepta string (pipes/CSV/; o espacios) o array.',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    examples: {
      pipes: 'jorge.torrez | angel.laura | alain.gonzales',
      csv: 'jorge.torrez, angel.laura, alain.gonzales',
      array: ['jorge.torrez', 'angel.laura', 'alain.gonzales'],
    },
  })
  @Transform(({ value }) => toEmailArray(value))
  @IsArray()
  @IsOptional()
  @IsEmail({}, { each: true })
  autor?: string[];

  @ApiProperty({ example: 'OBN-123-2025' })
  @IsNotEmpty()
  codigoObra!: string;

  @ApiProperty({ example: 'Construcción de puente vehicular en la Av. Mariscal' })
  @IsNotEmpty()
  nombreObra!: string;

  @ApiProperty({ example: 'Aprobación de solicitud de modificación' })
  @IsNotEmpty()
  actividad!: string;

  @ApiProperty({ example: 'Favor emitir informe técnico y legal.' })
  @IsNotEmpty()
  proveido!: string;
}
