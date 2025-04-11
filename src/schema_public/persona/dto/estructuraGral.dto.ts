import { ApiProperty } from "@nestjs/swagger";

export class EstructuraGralDto {
      
    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    codigoue: number[];

    @ApiProperty()
    gestion: string;


}
