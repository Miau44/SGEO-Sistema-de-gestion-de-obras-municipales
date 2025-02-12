import { PartialType } from '@nestjs/mapped-types';
import { CreateDesignacionDto } from './create-designacion.dto';
import { ApiProperty } from "@nestjs/swagger";


export class UpdateDesignacionDto {

    @ApiProperty()
    id_tipo_solicitud:number;

    @ApiProperty()
    id_obra: number;

    @ApiProperty()
    id_persona: number;    

    @ApiProperty()
    fecha_baja: Date;

    @ApiProperty()
    fecha_efectiva: Date;
    
    @ApiProperty()
    justificacion_baja: string;

    @ApiProperty()
    estado_designacion: number;
        
        
    @ApiProperty()
    usuario_registro: number;

    @ApiProperty()
    id_estado: number

}