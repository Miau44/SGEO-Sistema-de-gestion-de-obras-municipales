import { ApiProperty } from "@nestjs/swagger";
export class CreateSolicitudHistorialDto {

    @ApiProperty()
    id_solicitud: number;    

    @ApiProperty()
    id_tipo_solicitud: number;

    @ApiProperty()
    nro_solicitud: number;      
      
    @ApiProperty()
    id_estado_solicitud: number;  

    @ApiProperty()
    id_obra: number;    

    @ApiProperty()
    id_estado_general: number;      
        
    @ApiProperty()
    id_usuario: number;    
    
    @ApiProperty()
    proveido: string;    
    
    @ApiProperty({type: 'object'})
    data_solicitud: string;         

    @ApiProperty()
    fecha_envio: Date;
        
    @ApiProperty()
    id_usuario_previo: number;   
                   
       
    @ApiProperty()
    usuario_registro: number;
    
    @ApiProperty()
    id_estado_registro: number;    
}
