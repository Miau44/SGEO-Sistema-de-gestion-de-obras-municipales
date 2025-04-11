import { IsDate, IsInt, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateMemorandumDto {
    @IsInt()
    @ApiProperty()
    @IsNotEmpty()
    id_obra: number;

    @IsInt()
    @ApiProperty()
    id_tipo_memo: number;

    @IsInt()
    @ApiProperty()
    id_correlativo: number;

    @IsDate()
    @ApiProperty()
    @IsNotEmpty()
    fecha_memo: Date;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    nombre_destinatario: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    referencia: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    descripcion: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    nombre_remitente: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    cargo_remitente: string;

    @IsInt()
    @ApiProperty()
    @IsNotEmpty()
    id_estado: number;

    @IsInt()
    @ApiProperty()
    @IsNotEmpty()
    id_usuario: number;
}
