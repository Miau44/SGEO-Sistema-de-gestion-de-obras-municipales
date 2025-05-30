
import { ApiProperty } from '@nestjs/swagger';

export class ComputoModificacionDto {
    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_modificacion_pago: number;
    
    @ApiProperty()
    id_solicitud_historial:number;

 
}