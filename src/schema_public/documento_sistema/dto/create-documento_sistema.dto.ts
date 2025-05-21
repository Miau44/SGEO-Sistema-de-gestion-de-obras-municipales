import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDocumentoSistemaDto {

  @IsNumber()
  @IsNotEmpty()
  id_documento: number;

  @IsNumber()
  @IsNotEmpty()
  id_obra: number;

  @IsString()
  @IsNotEmpty()
  nombre_tabla_relacion: string;

  @IsNumber()
  @IsNotEmpty()
  id_tipo_relacion: number;

  @IsString()
  @IsNotEmpty()
  ruta_documento: string;

}
