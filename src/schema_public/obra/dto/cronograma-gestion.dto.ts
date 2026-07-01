import { ApiProperty } from "@nestjs/swagger";

export class CronogramaGestionDto {
  gestion: number;
  unidad_ejecutora?: string; // opcional
}
