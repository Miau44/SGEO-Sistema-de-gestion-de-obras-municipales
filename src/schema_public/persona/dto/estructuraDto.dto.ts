import { ApiProperty } from "@nestjs/swagger";

export class EstructuraDto {

    @ApiProperty()
    idrol: string;    

    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    codigoue: number[];

    @ApiProperty()
    gestion: string;

/*    @ApiProperty({})
    permiso: any;*/

    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    permiso: number[];  // Cambiado a array de números


    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    estado: number[];  // Cambiado a array de números


}
