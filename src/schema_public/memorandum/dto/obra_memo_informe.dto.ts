import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class GuardarObraDto {
    
    @ApiProperty()
    @IsInt()
    idObra: number;

    @ApiProperty()
    @IsInt()
    idTipoObra: number;

    @ApiProperty()
    @IsInt()
    numeroPagos: number;

    @ApiProperty()
    @IsInt()
    planillasAnticipo: number;

    @ApiProperty()
    @IsDateString()
    fechaOrdenProceder: string;

    @ApiProperty()
    @IsDateString()
    fechaRecepProvisional: string;

    @ApiProperty()
    @IsInt()
    plazoProvDefinitiva: number;

    @ApiProperty()
    @IsDateString()
    fechaRecepDefinitiva: string;

    @ApiProperty()
    @IsDateString()
    fechaInicio: string;

    @ApiProperty()
    @IsInt()
    plazoEjecucion: number;

    @ApiProperty()
    @IsInt()
    idTipoMemo: number;

    @ApiProperty()
    @IsInt()
    idCorrelativoMemo: number;

    @ApiProperty()
    @IsDateString()
    fechaMemo: string;

    @ApiProperty()
    @IsString()
    nombreDestinatario: string;

    @ApiProperty()
    @IsString()
    referencia: string;

    @ApiProperty()
    @IsString()
    descripcion: string;

    @ApiProperty()
    @IsString()
    nombreRemitente: string;

    @ApiProperty()
    @IsString()
    cargoRemitente: string;

    @ApiProperty()
    @IsInt()
    idEstadoMemo: number;

    @ApiProperty()
    @IsInt()
    idUsuarioMemo: number;

    @ApiProperty()
    @IsInt()
    idTipoInforme: number;

    @ApiProperty()
    @IsString()
    antecedentes: string;

    @ApiProperty()
    @IsString()
    analisis: string;

    @ApiProperty()
    @IsString()
    obsGeneral: string;

    @ApiProperty()
    @IsString()
    conclusion: string;

    @ApiProperty()
    @IsString()
    recomendacion: string;

    @ApiProperty()
    @IsInt()
    idCorrelativoInforme: number;

    @ApiProperty()
    @IsInt()
    usuarioRegistro: number;

    @ApiProperty()
    @IsInt()
    idEstadoInforme: number;
}
