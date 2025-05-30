import { IsNumber, IsString, IsOptional, Matches } from 'class-validator';
export class ContratoDlcDto {
    @IsNumber()
    ridproceso: number;

    @IsString()
    rmodalidad: string;

    @IsNumber()
    ridcodcarpeta: number;

    @IsString()
    rcuce: string;

    @IsString()
    rcodporceso: string;

    @IsString()
    rfechaproceso: string;

    @IsString()
    rusuario: string;

    @IsString()
    rmonto: string;

    @IsString()
    rtipoplazoini: string;

    @IsString()
    rplazo: string;

    @IsString()
    rnit: string;

    @IsString()
    rnrocontrato: string;

    @IsString()
    rtipocontrato: string;

    @IsString()
    rmontocontrato: string;

    @IsString()
    rtipoplazocontrato: string;

    @IsNumber()
    rplazocontrato: number;

    @IsString()
    radjudicadocontrato: string;

    @IsString()
    rfechacontrato: string;

    @IsString()
    rvigencia: string;

    @IsString()
    rdomicilio: string;

    @IsString()
    rtelef: string;

    @IsString()
    url: string;

    @IsString()
    id_contrato: string;

    @IsString()
    elreplegal: string;
}