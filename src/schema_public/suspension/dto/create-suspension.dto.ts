import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNotEmpty, IsString } from "class-validator";
export class CreateSuspensionDto {

    @IsInt()  
    @IsNotEmpty()  
    @ApiProperty()
    id_obra: number;   

    @ApiProperty()
    id_tipo_suspension: number;   
    
    @ApiProperty()
    id_motivo_suspension: number;   
    
    @ApiProperty()
    fecha_suspension: Date;  
    
    @ApiProperty()
    justificacion: string;  
    
    @ApiProperty()
    id_estado_asignacion: number;  
    
    @IsInt()
    @ApiProperty()
    @IsNotEmpty()    
    id_usuario: number;      

    @IsInt()
    @ApiProperty()
    @IsNotEmpty()
    id_estado: number;   
    
      @IsInt()
    @ApiProperty()
    @IsNotEmpty()
    id_memo: number;  

}
