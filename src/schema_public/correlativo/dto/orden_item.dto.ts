
import { ApiProperty } from "@nestjs/swagger";
export class OrdenItems {
    @ApiProperty()
    id_obra: number;
    
    @ApiProperty()
    orden_sim: string;
    
    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number;    
}