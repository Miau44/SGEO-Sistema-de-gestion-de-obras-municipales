import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @ApiProperty({ required: false })
  id_obra?: number;

  @ApiProperty({ required: false })
  id_orden_item?: number;

  @ApiProperty({ required: false })
  codigo_item?: string;

  @ApiProperty({ required: false })
  item?: string;

  @ApiProperty({ required: false })
  unidad_medida?: string;

  @ApiProperty({ required: false })
  cantidad_sim?: number;

  @ApiProperty({ required: false })
  p_unitario_sim?: number;

  @ApiProperty({ required: false })
  total_item_sim?: number;

  @ApiProperty({ required: false })
  fuente_financiamiento?: string;

  @ApiProperty({ required: false })
  p_unitario_adjudicado?: number;

  @ApiProperty({ required: false })
  total_adjudicado?: number;

  @ApiProperty({ required: false })
  cantidad_modificacion?: number;

  @ApiProperty({ required: false })
  total_modificacion?: number;

  @ApiProperty({ required: false })
  p_unitario_modificacion?: number;

  @ApiProperty({ required: false })
  tipo_modificacion?: string;

  @ApiProperty({ required: false })
  numero_modificacion?: number;

  @ApiProperty({ required: false })
  tipo_item?: string;

  @ApiProperty({ required: false })
  estado_item?: number;

  @ApiProperty({ required: false })
  id_usuario?: number;
}
