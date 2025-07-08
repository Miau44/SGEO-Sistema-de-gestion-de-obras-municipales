import { ApiProperty } from "@nestjs/swagger";

export class CreatePagoDto {

    @ApiProperty()
    id_modificacion_pago: number;   

    @ApiProperty()
    monto_presente: number;      

    @ApiProperty()
    deduccion: number;      
    
    @ApiProperty()
    retencion: number;      
    
    @ApiProperty()
    multa: number;   

    @ApiProperty()
    importe_por_pagar: number;   

    @ApiProperty()
    monto_acumulado: number;      

    @ApiProperty()
    porcentaje_presente: number;      

    @ApiProperty()
    porcentaje_acumulado: number;    
    
    @ApiProperty()
    fecha_aprobacion_pago: Date;      
    
    @ApiProperty()
    fecha_aprobacion_contrato: Date;   

    @ApiProperty()
    fecha_supervisor: Date;      

    @ApiProperty()
    fecha_fiscal: Date;   
    
    @ApiProperty()
    fecha_certificado: Date;   

    @ApiProperty()
    fecha_frp: Date;   

    @ApiProperty()
    fecha_inicio_periodo: Date;   

    @ApiProperty()
    fecha_fin_periodo: Date;   

    
    @ApiProperty()
    id_usuario_registro: number;          
        
    @ApiProperty()
    id_estado: number;        


}
