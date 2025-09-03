import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsOptional } from "class-validator";

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

    @ApiProperty()
    referencia: string;

    @ApiProperty({required: false})
    fecha_aprobacion: Date;  

    @ApiProperty({required: false})
    informe_modificacion:string;

  /*  @ApiProperty({type: 'object'})
    informe_inicial: string;*/
    
    @ApiProperty()
    usuario_registro: number;  

    @ApiProperty()
    id_estado: number;

     @ApiProperty({ type: Object})
     @IsOptional()
     @IsObject()
     a_nombre?: string;

     @ApiProperty()
     a_cargo: string;

     @ApiProperty()
     via_nombre: string;

     @ApiProperty()
     via_cargo: string;

     @ApiProperty({ type: Object, required: false, description: 'JSON con datos de de_nombre' })
     @IsOptional()
     @IsObject()
     de_nombre?: string;

     @ApiProperty()
     de_cargo: string;

}
