import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty()
  id_obra: number;

  @ApiProperty()
  codigo_item: string;

  @ApiProperty()
  partida_sim: number;

  @ApiProperty()
  orden_sim: number; 

  @ApiProperty()
  id_item_sim: number;

  @ApiProperty()
  desc_item: string;

  @ApiProperty()
  unidad_medida_sim: string;

  @ApiProperty()
  cantidad_sim: number;

  @ApiProperty()
  p_unitario_sim: number;

  @ApiProperty()
  total_item_sim: number;

  @ApiProperty()
  fuente_financiamiento_sim: string;

  @ApiProperty()
  p_unitario_adjudicado: number;

  @ApiProperty()
  total_adjudicado: number;

  @ApiProperty()
  cantidad_modificacion: number;

  @ApiProperty()
  total_modificacion: number;

  @ApiProperty()
  p_unitario_modificacion: number;

  @ApiProperty()
  id_tipo_modificacion: number;

  @ApiProperty()
  numero_modificacion: number;

  @ApiProperty()
  id_tipo_item: number;  

  @ApiProperty()
  cantidad_pago_aprobado: number;

  @ApiProperty()
  monto_pago_aprobado: number;

  @ApiProperty()
  nro_pago: number;

  @ApiProperty()
  tipo_pago: number;

  @ApiProperty()
  estado_pago: number;

  @ApiProperty()
   finalizado: boolean;  

  @ApiProperty()
  id_usuario_registro: number;

  @ApiProperty()
  id_estado: number;


}