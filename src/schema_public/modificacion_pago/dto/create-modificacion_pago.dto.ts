import { ApiProperty } from "@nestjs/swagger";

export class CreateModificacionPagoDto {

    @ApiProperty()
    id_obra: number;       

    @ApiProperty()
    id_solicitud: number;      

    @ApiProperty()
    id_tipo_mod_pago: number;      

    @ApiProperty()
    id_correlativo_tipo: number;      

    @ApiProperty()
    id_correlativo_subtipo: number;      

    @ApiProperty()
    id_usuario_registro: number;          
        
    @ApiProperty()
    id_estado: number;   

}
