import { IsDate, IsInt, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
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


    @ApiProperty()
   /* @IsDate()
    @IsNotEmpty()*/
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


      @ApiProperty({ type: Object, required: false, description: 'JSON con datos de de_nombre' })
       @IsOptional()
       @IsObject()
       de_nombre?: string;
}
