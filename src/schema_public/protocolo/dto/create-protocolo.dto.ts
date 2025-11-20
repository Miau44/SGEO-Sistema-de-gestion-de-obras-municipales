import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
export class CreateProtocoloDto {

    @ApiProperty({ required: false })
    referencia_tabla_historico: string;

    @ApiProperty({ required: false })
    id_tabla_historico: number;

    @ApiProperty({ required: false })
    id_obra: number;

    @ApiProperty({ required: false })
    id_referencia_modulo: number;

    @ApiProperty({ required: false })
    justificacion: string;

    @ApiProperty({ required: false })
    id_usuario: number;

}
