

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength  } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ description: 'Nombre de usuario', example: 'usuario123' })
  @IsNotEmpty()
  @IsString()
  usuario!: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}
