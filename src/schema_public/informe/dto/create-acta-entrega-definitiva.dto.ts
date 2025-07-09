import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, IsOptional, IsNotEmpty } from "class-validator";

export class CreateActaEntregaDefinitivaDto {

  @ApiProperty()
  id_obra: number;

  @IsString()
  @ApiProperty({ example: '08:30:00' })
  hora_registro: string;

  @ApiProperty()
  periodo_correccion: number;

  @ApiProperty()
  obs_general: string;

  @ApiProperty({
    required: false,
    type: 'array',
    description: 'Array de objetos con id_documento',
    example: [{ id_documento: 1 }, { id_documento: 2 }],
  })
  id_documento?: { id_documento: number }[];

  @ApiProperty()
  usuario_registro: number;
}
