import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEmpresaDto {
    
    @ApiProperty()
    @IsInt()
    id_obra: number;
  
    @ApiProperty()
    @IsString()
    razon_social: string;
  
    @ApiProperty()
    @IsOptional()
    @IsString()
    nit?: string;
  
    @ApiProperty()
    @IsString()
    direccion: string;
  
    @ApiProperty()
    @IsOptional()
    @IsString()
    telefono?: string;
  
    @ApiProperty()
    @IsString()
    representante_legal: string;
  
    @ApiProperty()
    @IsInt()
    id_estado: number;
  
    @ApiProperty()
    @IsInt()
    id_usuario: number;
}
