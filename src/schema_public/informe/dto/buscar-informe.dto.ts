import { ApiProperty } from '@nestjs/swagger';

export class BuscarTipoInformeDto {
  @ApiProperty()
  id_solicitud: number;
}