import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateActaEntregaProvDto {
  @IsNumber()
  id_informe: number;

  @IsOptional()
  @IsString()
  hora_registro?: string;

  @IsOptional()
  @IsString()
  obs_general?: string;

  @IsOptional()
  id_documento?: { id_documento: number }[];
}
