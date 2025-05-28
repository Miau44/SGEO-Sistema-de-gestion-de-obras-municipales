import { ApiProperty } from "@nestjs/swagger";

export class CreateInformeNuevoDto {

    @ApiProperty()
    id_obra: number;   

    @ApiProperty()
    id_tipo_informe: number;  
    
        
    @ApiProperty()
    id_usuario_registro: number;  

    @ApiProperty()
    id_estado: number;

}
