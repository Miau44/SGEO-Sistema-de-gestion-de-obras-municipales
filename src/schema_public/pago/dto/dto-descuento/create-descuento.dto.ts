import { ApiProperty } from "@nestjs/swagger";

export class CreateDescuentoDto {

    @ApiProperty()
    p_id_descuento: number;       

    @ApiProperty()
    p_id_pago: number;   

    @ApiProperty()
    p_id_tipo_descuento: number;      

    @ApiProperty()
    p_monto: number;      
    
    @ApiProperty()
    p_id_subtipo_descuento: number;      
    

    @ApiProperty()
    p_detalle: string;   

        
    @ApiProperty()
    p_id_usuario_registro: number;          
        
    @ApiProperty()
    id_estado: number;        


}
