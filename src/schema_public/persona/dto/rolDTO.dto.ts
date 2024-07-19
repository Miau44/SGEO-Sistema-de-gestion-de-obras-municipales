/*import { ApiProperty  } from "@nestjs/swagger";

export class RolDto {

    @ApiProperty()
    id_rol: string[]; 
    @ApiProperty()    
    gestion?: number;    
}
*/


import { ApiProperty } from '@nestjs/swagger';

export class RolDto {
  @ApiProperty({ type: [String], description: 'Array de IDs' })
  id_rol: string[];

  @ApiProperty({ type: Number, description: 'Valor de gestión' })
  gestion: number;
}
