import { ApiProperty } from "@nestjs/swagger";

export class CreateMaestroDto {

    @ApiProperty()
    tipo: number;     
    
    @ApiProperty()
    subtipo: number;        

    @ApiProperty()
    id_obra: number;   
    
    @ApiProperty()
    id_usuario: number;       



}
