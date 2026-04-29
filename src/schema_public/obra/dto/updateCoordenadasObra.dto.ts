import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class UpdateCoordenadasObraDto {
  @ApiProperty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @ApiProperty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

  @ApiProperty()
  @IsInt()
  id_usuario: number;

  @ApiProperty()
  @IsInt()
  id_permiso: number;
}