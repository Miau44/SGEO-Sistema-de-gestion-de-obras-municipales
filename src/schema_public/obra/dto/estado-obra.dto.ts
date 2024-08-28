import { ApiProperty } from "@nestjs/swagger";

export class EstadoObraDto {

    /*  @ApiProperty({ default:0 })
      desc_cod_ue: number;*/
  
      @ApiProperty({ default:0 })
      gestion: number; 
               
    /*  @ApiProperty({ default:0 })
      estado_general: number;    */


      @ApiProperty()
      usuario: string;  

      @ApiProperty({ type: [Number], description: 'Array de IDs' })
      id_estado_designacion: number[];  // Cambiado a array de números
  
        
  
  }
  