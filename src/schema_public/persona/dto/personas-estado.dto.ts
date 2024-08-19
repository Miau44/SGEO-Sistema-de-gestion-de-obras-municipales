import { ApiProperty } from '@nestjs/swagger';

export class PersonasEstadoDto {
    @ApiProperty({ type: Number, description: 'Valor de gestión' })
    gestion: number;

    @ApiProperty({ })
    id_rol: number

    @ApiProperty({ type: Number, description: 'valor de obra' })
    id_obra: number;

   
    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    id_estado_designacion: number[];  // Cambiado a array de números

}