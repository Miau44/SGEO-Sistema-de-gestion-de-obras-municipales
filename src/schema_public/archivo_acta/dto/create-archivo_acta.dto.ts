import { ApiProperty } from "@nestjs/swagger";

export class CreateArchivoActaDto {

     @ApiProperty()
    id_obra: number;      

     @ApiProperty()
    id_tipo_acta: number;

     @ApiProperty()
    id_tipo_registro: number;
    
     @ApiProperty()
    nombre_encargado: string;

     @ApiProperty()
    hora_registro: string;

     @ApiProperty()
    numero_fojas: number;

     @ApiProperty()
    fecha_in_out: Date;

     @ApiProperty()
    nombre_fiscal: string;

     @ApiProperty()
    ci_encargado: number;

     @ApiProperty()
    observacion: string;

     @ApiProperty()
    id_documento: number;

     @ApiProperty()
    fecha_entrega_fiscal: Date;

     @ApiProperty()
    fecha_devolucion_fiscal: Date;

     @ApiProperty()
    id_estado: number;
    
     @ApiProperty()
    usuario_registro: number;

    
}
