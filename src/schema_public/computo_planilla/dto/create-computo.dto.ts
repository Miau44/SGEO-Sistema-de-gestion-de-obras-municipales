
import { ApiProperty } from "@nestjs/swagger";
export class CreateComputoDto {

    @ApiProperty()
    id_item: number;
  
    @ApiProperty()
    tramo: string;

    @ApiProperty()
    descripcion: string;    

    @ApiProperty()
    numero_veces: number;    

    @ApiProperty()
    alto: number;   
    
    @ApiProperty()
    largo: number;    

    @ApiProperty()
    ancho: number;    

    @ApiProperty()
    area: number;    

    @ApiProperty()
    area_total: number;   
    
    @ApiProperty()
    volumen: number;       
        
    @ApiProperty()
    volumen_total: number;      
        
    @ApiProperty()
    parcial: number;         

    @ApiProperty()
    id_tipo_computo: number;     
    
    @ApiProperty()
    justificacion: string;      
        
    @ApiProperty()
    id_usuario_registro: number;       

    @ApiProperty()
    id_estado: number;       
    
    

}
