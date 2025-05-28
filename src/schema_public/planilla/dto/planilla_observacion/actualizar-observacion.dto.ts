import { ApiProperty } from "@nestjs/swagger";
export class actualizarObservacionDto {

    
    @ApiProperty()
    id_modificacion_pago: number;

    @ApiProperty()
    id_item: number;

    @ApiProperty()
    id_solicitud_historial: number;    

  

    @ApiProperty({required:false})
    observacion_fiscal: string;   
    
    @ApiProperty()
    estado_observacion_fis: boolean;   
        
    @ApiProperty()
    id_usuario_registro: number;


}