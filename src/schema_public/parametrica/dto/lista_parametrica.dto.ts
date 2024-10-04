import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateListaParametricaDto {
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

export class UpdateListaParametricaDto extends PartialType(CreateListaParametricaDto) {}
