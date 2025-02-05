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
    id_correlativo: number;      

    @ApiProperty()
    id_correlativo_general: number;   

    @ApiProperty()
    dias_variacion: number;     
        
    @ApiProperty()
    monto_variacion: number;    
        
    @ApiProperty()
    monto_total: number; 

    @ApiProperty()
    porcentaje_modificacion: number;    
        
    @ApiProperty()
    porcentaje_total: number;     

    @ApiProperty()
    num_contrato_modificatorio: number;    
        
    @ApiProperty()
    fecha_aprobacion_contrato: Date;        
    
    @ApiProperty()
    id_usuario_registro: number;          
        
    @ApiProperty()
    id_estado: number;   

}