import { ApiProperty } from "@nestjs/swagger";

export class CreateInformeDto {

    @ApiProperty()
    id_obra: number;   

    @ApiProperty()
    id_tipo_informe: number;      

    @ApiProperty()
    antecedentes: string; 

    @ApiProperty()
    analisis: string;    

    @ApiProperty()
    obs_general: string;       

    @ApiProperty()
    conclusion: string;   

    @ApiProperty()
    recomendacion: string;   

  /*  @ApiProperty({type: 'object'})
    informe_inicial: string;*/
    
    @ApiProperty()
    usuario_registro: number;  

    @ApiProperty()
    id_estado: number;

}
