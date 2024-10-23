import { ApiProperty } from "@nestjs/swagger";
export class CreateInstanciaFlujoDto {

    @ApiProperty()
    id_flujo: number;

    @ApiProperty()
    fecha_inicio: Date;

    @ApiProperty()
    fecha_fin: Date;    

    @ApiProperty()
    id_generico: number;    

    @ApiProperty()
    observacion: string;   

    @ApiProperty()
    finalizado: boolean;   

    @ApiProperty()
    usuario_registro: number; 



}
