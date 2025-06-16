import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, IsOptional, IsNotEmpty } from "class-validator";

export class CreateInformeObraDto {

  @ApiProperty()
  id_tipo_solicitud: number; // <-- antes faltaba

  @ApiProperty()
  id_obra: number;

  @ApiProperty()
  usuario_registro: number;

  @ApiProperty()
  id_tipo_informe: number;

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
  referencia: string;

  
  @ApiProperty({ required: false })
  informe_modificacion?: string;

  @ApiProperty({ required: false })
  anexos?: string;

  @ApiProperty({
    required: false,
    type: 'array',
    description: 'Array de objetos con id_documento',
    example: [{ id_documento: 1 }, { id_documento: 2 }],
  })
  id_documento?: { id_documento: number }[];
}
