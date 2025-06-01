import { ApiProperty } from '@nestjs/swagger';

export class ListaFiscalDto {


    @ApiProperty()
    id_modificacion_pago: number;
           
    @ApiProperty()
    id_usuario: number;

}