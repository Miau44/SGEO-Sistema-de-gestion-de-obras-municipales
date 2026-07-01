import { PartialType } from '@nestjs/mapped-types';

import { ApiProperty } from '@nestjs/swagger';

export class FechasModPagoDto {

    @ApiProperty()
    p_id_modificacion_pago: number;

    @ApiProperty()
    p_tipo_operacion: number;  
    
    @ApiProperty()    
    p_tipo_rol: number;      

   
    
}