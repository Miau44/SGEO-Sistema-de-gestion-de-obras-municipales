

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

  /*@ApiProperty({
    example: [{ id_usuario: 188 }, { id_usuario: 189 }],
    description: 'Arreglo de usuarios a notificar (JSON)',
    type: 'array',
    items: { type: 'object', properties: { id_usuario: { type: 'number' } } },
  })*/

  @ApiProperty()
  p_proveido: string;

}