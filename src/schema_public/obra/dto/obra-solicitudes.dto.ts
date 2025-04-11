import { ApiProperty } from "@nestjs/swagger";

export class ObraSolicitudesDto {

    /*  @ApiProperty({ default:0 })
      desc_cod_ue: number;*/
  
      @ApiProperty()
      gestion: number; 
               
    /*  @ApiProperty({ default:0 })
      estado_general: number;    */

      @ApiProperty()
      usuario: number;  

      @ApiProperty({ type: [Number], description: 'Array de IDs' })
      id_estado_designacion: number[];  // Cambiado a array de números
  
        
  
  }
  