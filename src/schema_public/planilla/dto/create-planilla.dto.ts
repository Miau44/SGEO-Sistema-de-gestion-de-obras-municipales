import { ApiProperty } from "@nestjs/swagger";
export class CreatePlanillaDto {

    @ApiProperty()
    id_modificacion: number;

  
    
    @ApiProperty()
    id_item: number;    
      
    @ApiProperty()
    cantidad_planilla: number;    

    @ApiProperty()
    monto_planilla: number;        

    @ApiProperty()
    tipo_item_modificacion: string;        
    
    @ApiProperty()
    cantidad_reordenamiento: number;     
    
    @ApiProperty()
    total_reordenamiento: number;   
    
    @ApiProperty()
    justificacion_supervisor: string;   

    @ApiProperty()
    observacion_fiscal: string;       

    @ApiProperty()
    estado_observacion_fis: boolean;       
    
    @ApiProperty()
    id_usuario_registro: number;   
    

    @ApiProperty()
    id_estado: number;   
    

}