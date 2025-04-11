import { ApiProperty } from '@nestjs/swagger';

export class PersonaSolcitudDto {


    @ApiProperty({ type: Number, description: 'valor de obra' })
    id_solicitud: number;

   
    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    id_estado_designacion: number[];  // Cambiado a array de números


    @ApiProperty({ type: Number, description: 'gestion' })
    gestion: number;    



}