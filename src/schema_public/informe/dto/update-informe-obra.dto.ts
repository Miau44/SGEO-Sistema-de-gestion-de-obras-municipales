import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsArray } from "class-validator";

export class UpdateInformeObraDto {
  @ApiProperty()
  id_informe: number;

  @ApiProperty()
  antecedentes: string;

  @ApiProperty()
  analisis: string;

  @ApiProperty()
  obs_general: string;

  @ApiProperty()
  conclusion: string;

  @ApiProperty()
  recomendacion: string;

  @ApiProperty()
  @IsOptional()
  referencia?: string;

  @ApiProperty()
  @IsOptional()
  informe_modificacion?: string;

  @ApiProperty()
  @IsOptional()
  anexos?: string;

  @ApiProperty({
    required: false,
    type: 'array',
    description: 'Array de objetos con id_documento',
    example: [{ id_documento: 1 }, { id_documento: 2 }],
  })
  @IsOptional()
  id_documento?: { id_documento: number }[];

  @ApiProperty()
  @IsOptional()
  usuario_registro?: number;
}

