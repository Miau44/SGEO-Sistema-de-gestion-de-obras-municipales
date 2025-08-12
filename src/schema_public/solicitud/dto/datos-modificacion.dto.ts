

import { ApiProperty } from '@nestjs/swagger';

export class ActualizarSolicitudDto {


 @ApiProperty()
  p_id_solicitud: number;

  @ApiProperty()
  p_id_usuario: number;

  @ApiProperty()
  p_usuario_registro: number;

  @ApiProperty()
  p_id_estado_general: number;

  @ApiProperty({
    required: false,
    type: 'array',
    description: 'Array de objetos con id_documento',
    example: [{ id_usuario: 1 }, { id_usuario: 2 }],
  })
  p_data_solicitud?: { id_usuario: number }[];

  @ApiProperty()
  p_proveido: string;


 @ApiProperty()
  p_id_estado_solicitud: number;  

}