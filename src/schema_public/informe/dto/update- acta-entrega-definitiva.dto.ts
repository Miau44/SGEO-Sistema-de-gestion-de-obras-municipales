import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateActaEntregaDefinitivaDto {
  @IsNumber()
  id_informe: number;

  @IsOptional()
  @IsString()
  hora_registro?: string;

  @IsOptional()
  fecha_acta?: Date;

  @IsOptional()
  id_documento?: { id_documento: number }[];
}
