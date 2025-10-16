import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProtocoloModificacionDto {

  @IsOptional() 
  id_obra!: number; 

  @IsOptional() 
  fecha_supervisor?: string | null;

  @IsOptional()
  fecha_fiscal?: string | null;
  
  @IsOptional() fecha_memo_minuta?: string | null;

  @IsString()
  @IsNotEmpty()
  justificacion!: string;

  @IsInt()
  id_usuario!: number;

}
