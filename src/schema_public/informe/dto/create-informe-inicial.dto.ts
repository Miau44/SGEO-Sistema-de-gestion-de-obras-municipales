import { ApiProperty } from "@nestjs/swagger";

export class CreateInformeInicialDto {

    @ApiProperty()
    id_informe: number;   

    @ApiProperty()
    id_subtipo: number;     
    
    @ApiProperty({type: 'object'})
    descripcion: string;         

     
    @ApiProperty()
    usuario_registro: number;  

    @ApiProperty()
    id_estado: number;

}
