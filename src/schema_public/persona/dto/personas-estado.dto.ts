import { ApiProperty } from '@nestjs/swagger';

export class PersonasEstadoDto {
    @ApiProperty({ type: Number, description: 'Valor de gestión' })
    gestion: number;

    @ApiProperty({ })
    id_rol: number

    @ApiProperty({ type: Number, description: 'valor de ficha' })
    id_obra: number;

  /*  @ApiProperty({ type: Number, description: 'valor del estado_solitud' })
    id_estado_designacion!: number;*/


}