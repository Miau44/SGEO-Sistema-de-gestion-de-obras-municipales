import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty()
  id_obra: number;

  @ApiProperty({ nullable: true })
  id_orden_item: number;

  @ApiProperty()
  codigo_item: string;

  @ApiProperty()
  item: string;

  @ApiProperty()
  unidad_medida: string;

  @ApiProperty()
  cantidad_sim: number;

  @ApiProperty()
  p_unitario_sim: number;

  @ApiProperty()
  total_item_sim: number;

  @ApiProperty({ nullable: true })
  fuente_financiamiento: string;

  @ApiProperty({ nullable: true })
  p_unitario_adjudicado: number;

  @ApiProperty({ nullable: true })
  total_adjudicado: number;

  @ApiProperty({ nullable: true })
  cantidad_modificacion: number;

  @ApiProperty({ nullable: true })
  total_modificacion: number;

  @ApiProperty({ nullable: true })
  p_unitario_modificacion: number;

  @ApiProperty({ nullable: true })
  tipo_modificacion: string;

  @ApiProperty({ nullable: true })
  numero_modificacion: number;

  @ApiProperty({ nullable: true })
  tipo_item: string;

  @ApiProperty()
  estado_item: number;

  @ApiProperty()
  id_usuario: number;
}