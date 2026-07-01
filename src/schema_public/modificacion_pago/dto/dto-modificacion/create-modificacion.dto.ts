import { ApiProperty } from "@nestjs/swagger";

export class CreateModificacionDto {

    @ApiProperty()
    id_modificacion_pago: number;   

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

    
    @ApiProperty({ required: false, nullable: true })
    numero_contrato_modificatorio?: string | null;   
    
    @ApiProperty()
    fecha_aprobacion_contrato: Date;      
    
    @ApiProperty()
    fecha_supervisor: Date;      

    @ApiProperty()
    fecha_fiscal: Date;      

    @ApiProperty()
    fecha_memo_minuta: Date;      

    @ApiProperty()
    id_usuario_registro: number;          
        
    @ApiProperty()
    id_estado: number;   



}