import { ApiProperty } from "@nestjs/swagger";

export class CreateObraDto {



    
@ApiProperty()
id_ficha: number;

@ApiProperty()
id_tipo_obra: number;

@ApiProperty()
id_modalidad: number;

@ApiProperty()
anticipo: boolean;


@ApiProperty()
procede: number;

@ApiProperty()
fecha_pago_anticipo!: Date | null;

@ApiProperty()
monto_anticipo?: number;


@ApiProperty()
usuario_registro: number;

@ApiProperty()
id_estado: number;

@ApiProperty({default:1})
id_estado_general: number;
}