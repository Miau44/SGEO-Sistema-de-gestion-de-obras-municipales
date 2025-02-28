import { ApiProperty } from "@nestjs/swagger";

export class CreateInformeDto {

    @ApiProperty()
    id_obra: number;   

    @ApiProperty()
    id_tipo_informe: number;  
    
    @ApiProperty()
    id_correlativo: number;

    @ApiProperty()
    antecedentes: string; 

    @ApiProperty({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id_documento: { type: 'number' }
        }
      },
      description: 'Lista de IDs de documentos en formato JSON',
      example: [
        { id_documento: 630 },
        { id_documento: 631 }
      ]
    })
    id_documento: { id_documento: number }[];

    @ApiProperty()
    analisis: string;    

    @ApiProperty()
    obs_general: string;       

    @ApiProperty()
    conclusion: string;   

    @ApiProperty()
    recomendacion: string;   

    @ApiProperty()
    anexos: string;   

    @ApiProperty()
    id_solicitud: number;

  /*  @ApiProperty({type: 'object'})
    informe_inicial: string;*/
    
    @ApiProperty()
    usuario_registro: number;  

    @ApiProperty()
    id_estado: number;

}
