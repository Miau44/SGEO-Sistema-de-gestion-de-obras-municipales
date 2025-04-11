import { ApiProperty } from "@nestjs/swagger";

export class CreatePagoDto {

    @ApiProperty()
    id_modificacion_pago: number;   

    @ApiProperty()
    monto_presente: number;      

    @ApiProperty()
    deducciones: number;      
    
    @ApiProperty()
    retenciones: number;      
    
    @ApiProperty()
    multas: number;   

    @ApiProperty()
    importe_por_pagar: number;   

    @ApiProperty()
    monto_acumulado: number;      

    @ApiProperty()
    porcentaje_ejecucion: number;      
    
    @ApiProperty()
    fecha_aprobacion_pago: Date;      
    
    @ApiProperty()
    fecha_aprobacion_contrato: Date;   


    @ApiProperty()
    fecha_supervisor: Date;      
    
    @ApiProperty()
    fecha_certificado: Date;   

    
    @ApiProperty()
    id_usuario_registro: number;          
        
    @ApiProperty()
    id_estado: number;        


}
