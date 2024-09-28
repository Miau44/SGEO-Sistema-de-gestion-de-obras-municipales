import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateListaTablaDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'Id tipo' })
  readonly id_tipo: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Descripción del tipo' })
  readonly desc_tipo: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'Usuario quien registró' })
  readonly usuario_registro: number;
}

export class UpdateListaTablaDto extends PartialType(CreateListaTablaDto) {}
