import { ApiProperty } from "@nestjs/swagger";

export class CreateModificacionDto {

    @ApiProperty()
    id_obra: number;   

    @ApiProperty()
    id_solicitud: number;      

    @ApiProperty()
    id_tipo_modificacion: number;      
    
    @ApiProperty()
    id_tipo_informe: number;      
    
    @ApiProperty()
    nro_modificacion: number;      

    @ApiProperty()
    nro_minuta: number;      
    
    @ApiProperty()
    id_usuario_registro: number;          
        
    @ApiProperty()
    id_estado: number;   

}