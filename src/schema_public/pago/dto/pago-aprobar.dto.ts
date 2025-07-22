
import { ApiProperty } from '@nestjs/swagger';

export class AprobarPagoDto {
    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_modificacion_pago: number;

    @ApiProperty()
    id_solicitud: number;  
    

    @ApiProperty()  //fiscal //supervisor
    id_tipo: number;  
        
    @ApiProperty()
    id_usuario: number;
    
}