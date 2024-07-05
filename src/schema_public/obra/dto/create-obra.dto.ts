import { ApiProperty } from "@nestjs/swagger";

export class CreateObraDto {

@ApiProperty()
cod_ue: number;

@ApiProperty()
nombre_ue: string;

@ApiProperty()
cod_poa: number;

@ApiProperty()
correlativo_carpeta: number;

@ApiProperty()
desc_carpeta: string;

@ApiProperty()
cod_estado_carpeta: number;

@ApiProperty()
fecha_validacion_carpeta: Date;

@ApiProperty()
total_carpeta: number;

@ApiProperty()
cod_carpeta: string;

@ApiProperty()
cod_prioridad_carpeta: number;

@ApiProperty()
gestion_carpeta: number;

@ApiProperty()
cod_carpeta_anterior: number;

@ApiProperty()
continuidad: number;

@ApiProperty()
desc_zona_carpeta: string;

@ApiProperty()
desc_distrito_carpeta: string;

@ApiProperty()
desc_macrodistrito_carpeta: string;

@ApiProperty()
usuario_registro: number;

@ApiProperty()
id_estado: number;

}