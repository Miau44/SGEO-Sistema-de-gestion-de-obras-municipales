import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ArrayNotEmpty, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';

export class TraspasoPendientesDto {

  @ApiProperty()
  gestion: number;

  @ApiProperty()
  usuarioOrigen?: number;

  @ApiProperty()
  usuarioNuevo: number;

  @ApiProperty({ required: false, description: 'Si se envía, limita el traspaso a esa obra' })
  @IsOptional()
  id_obra?: number;

  @ApiProperty({ type: [Number], description: 'Array de IDs' })
  @IsArray() @ArrayNotEmpty()
  estado: number[];

  @ApiProperty({ required: false, default: false })
  @IsOptional() @IsBoolean()
  simular?: boolean = false;


}