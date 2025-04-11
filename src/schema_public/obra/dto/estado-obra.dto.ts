import { ApiProperty, ApiPropertyOptional  } from "@nestjs/swagger";

export class EstadoObraDto {

    /*  @ApiProperty({ default:0 })
      desc_cod_ue: number;*/
  
      @ApiProperty({ default:0 })
      gestion: number; 
               
    /*  @ApiProperty({ default:0 })
      estado_general: number;    */


      @ApiProperty()
      usuario: string;  

      @ApiProperty({ description: 'Estado de ', required: false })
      validada?: boolean;
    
      @ApiProperty({ description: 'Excluir ', required: false })
      designada?: boolean;      

    /*  @ApiProperty({ type: [Number], description: 'Array de IDs' })
      id_estado_designacion: number[];  // Cambiado a array de números
      @ApiPropertyOptional({ type: Number, description: 'Valor límite para el estado (<8)', example: 8 })
      notIn?: number;*/

        

    /*  @ApiPropertyOptional({ type: [Number], description: 'Array de estados para la consulta IN', example: [6, 7] })
      in?: number;
    
      @ApiPropertyOptional({ type: Number, description: 'Valor límite para el estado (<8)', example: 8 })
      lt?: number;*/



  
  }
  