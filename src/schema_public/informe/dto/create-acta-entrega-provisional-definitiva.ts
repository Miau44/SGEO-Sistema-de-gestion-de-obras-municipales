import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, IsOptional, IsNotEmpty } from "class-validator";

export class CreateActaEntregaProvisionalDefinitivaDto {

  @ApiProperty()
  id_obra: number;

  @IsString()
  @ApiProperty({ example: '08:30:00' })
  hora_registro: string;
  
  @ApiProperty({required: false})
  fecha_acta: Date;
  
  @ApiProperty({ required: false })
  @IsOptional()
  obs_general?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  periodo_correccion?: number;

  @ApiProperty({
    required: false,
    type: 'array',
    description: 'Array de objetos con id_documento',
    example: [{ id_documento: 1 }, { id_documento: 2 }],
  })
  id_documento?: { id_documento: number }[];

  @ApiProperty()
  usuario_registro: number;

  @ApiProperty({ enum: ['provisional', 'definitiva'] })
  tipo_acta: 'provisional' | 'definitiva';
}
