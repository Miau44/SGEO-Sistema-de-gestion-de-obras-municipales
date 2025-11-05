import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString } from "class-validator";
export class CreateAvanceFisicoDto {

    @ApiProperty({ required: false, enum: [0, 1, 9], default: 1 })
    id_estado_avance: number;

    @ApiProperty({example: 75.25 })
    porcentaje_obra: number;

    @ApiProperty({ example: 50 })
    id_obra: number;

    @ApiProperty({ example: '2025-10-01'})
    fecha_inspeccion: string; 

    @ApiProperty({ example: 3337777 })
    correlativo_carpeta: number;        
    
    @ApiProperty()
    observaciones: string

    @ApiProperty({ required: false })
    recomendaciones?: string;

    @IsString()
    @ApiProperty({ example: '08:30:00' })
    hora_inicio: string; 

    @IsString()
    @ApiProperty({ example: '08:30:00' })
    hora_final: string;

    @ApiProperty({ required: false, enum: ['f','s'], description: `'f'=Fiscal, 's'=Supervisor`, default: 's' })
    @IsOptional() @IsIn(['s','f'])
    rol_avance?: 's' | 'f';

    @ApiProperty({ example: 123})
    id_usuario: number;

    @ApiProperty({ required: false, type: [Number], example: [1455, 1456] })
    @IsOptional() @Type(() => Number) @IsInt({ each: true })
    ids_documento?: number[];
}
