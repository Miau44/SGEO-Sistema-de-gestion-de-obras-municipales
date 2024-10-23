import { ApiProperty } from "@nestjs/swagger";
export class TareaDatosDto {
    
    @ApiProperty()
    idInstanciaFlujo: number;

    @ApiProperty()
    usuario_registro: number;       

    @ApiProperty()
    observacion: string;
    
    @ApiProperty()
    idTareaDestino: number;

}
