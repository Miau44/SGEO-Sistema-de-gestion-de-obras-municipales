import { ApiProperty } from "@nestjs/swagger";

export class ListaEstructuraDto {

  
    @ApiProperty()
    gestion: number;

    @ApiProperty()
    usuario: string;
  


    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    permiso: number[];  // Cambiado a array de números

  
}
