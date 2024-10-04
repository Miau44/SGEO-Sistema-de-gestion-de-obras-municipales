import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateParametricaDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'Id tipo' })
  readonly id_tipo: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Descripción del subtipo' })
  readonly desc_subtipo: string;

  @IsString()
  @ApiProperty({ description: 'Detalle del subtipo' })
  readonly detalle: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'Id padre' })
  readonly id_padre: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'Id padre' })
  readonly id_protegido: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'Usuario quien registró' })
  readonly usuario_registro: number;
}

export class UpdateParametricaDto extends PartialType(CreateParametricaDto) {}
