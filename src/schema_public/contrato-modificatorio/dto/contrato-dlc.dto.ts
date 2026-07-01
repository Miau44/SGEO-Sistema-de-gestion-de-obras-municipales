import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContratoDlcDto {
  @ApiProperty({ example: 123, description: 'ID del proceso' })
  @IsNumber()
  ridproceso: number;

  @ApiProperty({ example: 'LP', description: 'Modalidad del proceso' })
  @IsString()
  rmodalidad: string;

  @ApiProperty({ example: 456, description: 'ID del código de carpeta' })
  @IsNumber()
  ridcodcarpeta: number;

  @ApiProperty({ example: '21-0415-00-123456-1-1', description: 'Código CUCE' })
  @IsString()
  rcuce: string;

  @ApiProperty({ example: 'C-001/2025', description: 'Código del proceso' })
  @IsString()
  rcodporceso: string;

  @ApiProperty({ example: '2025-06-01', description: 'Fecha del proceso' })
  @IsString()
  rfechaproceso: string;

  @ApiProperty({ example: 'usuario1', description: 'Usuario responsable del proceso' })
  @IsString()
  rusuario: string;

  @ApiProperty({ example: '100000.00', description: 'Monto del proceso' })
  @IsString()
  rmonto: string;

  @ApiProperty({ example: 'DÍAS', description: 'Tipo de plazo inicial' })
  @IsString()
  rtipoplazoini: string;

  @ApiProperty({ example: '30', description: 'Plazo inicial' })
  @IsString()
  rplazo: string;

  @ApiProperty({ example: '123456789', description: 'NIT de la empresa adjudicada' })
  @IsString()
  rnit: string;

  @ApiProperty({ example: 'CON-001/2025', description: 'Número del contrato' })
  @IsString()
  rnrocontrato: string;

  @ApiProperty({ example: 'COMPRA DE BIENES', description: 'Tipo de contrato' })
  @IsString()
  rtipocontrato: string;

  @ApiProperty({ example: '95000.00', description: 'Monto del contrato' })
  @IsString()
  rmontocontrato: string;

  @ApiProperty({ example: 'DÍAS', description: 'Tipo de plazo del contrato' })
  @IsString()
  rtipoplazocontrato: string;

  @ApiProperty({ example: 60, description: 'Plazo del contrato' })
  @IsNumber()
  rplazocontrato: number;

  @ApiProperty({ example: 'EMPRESA S.A.', description: 'Nombre del adjudicado en el contrato' })
  @IsString()
  radjudicadocontrato: string;

  @ApiProperty({ example: '2025-06-10', description: 'Fecha de firma del contrato' })
  @IsString()
  rfechacontrato: string;

  @ApiProperty({ example: '2025', description: 'Vigencia del contrato' })
  @IsString()
  rvigencia: string;

  @ApiProperty({ example: 'Calle Falsa 123', description: 'Domicilio legal' })
  @IsString()
  rdomicilio: string;

  @ApiProperty({ example: '76543210', description: 'Teléfono de contacto' })
  @IsString()
  rtelef: string;

  @ApiProperty({ example: 'http://ejemplo.com/contrato.pdf', description: 'URL del documento del contrato' })
  @IsString()
  url: string;

  @ApiProperty({ example: 'CTR-2025-0001', description: 'ID interno del contrato' })
  @IsString()
  id_contrato: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del representante legal' })
  @IsString()
  elreplegal: string;

  @ApiProperty({ example: 'infracciones graves', description: 'causa de resolucion de contrato' })
  @IsString()
  causa_dlc: string;

  @ApiProperty({ example: 'http://ejemplo.com/contrato.pdf', description: 'URL del documento del contrato resolucion' })
  @IsString()
  url_resolucion: string;
}
