import { ApiProperty } from "@nestjs/swagger";
import { SubDesignacionDto } from "./subdto-designacion.dto";

export class EstadoObraDesigDto {

    /*@ApiProperty()
    id_solicitud : number; */

 
 @ApiProperty({ 
        type: [SubDesignacionDto], 
        description: 'Array de objetos con ID y número' 
      })
      designacion: SubDesignacionDto[];    
    
    @ApiProperty()
    id_solicitud : number;   
      
    @ApiProperty()
    id_obra: number;    

    @ApiProperty()
    id_estado_flujo : number;  
    
    @ApiProperty()
    id_usuario: number;        

   /* @ApiProperty()
    desccodue: number;*/
}